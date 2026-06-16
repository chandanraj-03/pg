from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from models import DocumentModel
from database import documents_collection, students_collection, fs
from bson import ObjectId
from datetime import datetime
from PIL import Image
import io

router = APIRouter()

@router.post("/upload", response_model=DocumentModel, status_code=status.HTTP_201_CREATED)
async def add_document(
    studentId: str = Form(...),
    name: str = Form(...),
    file: UploadFile = File(...)
):
    if not ObjectId.is_valid(studentId):
        raise HTTPException(status_code=400, detail="Invalid Student ID")
        
    student = await students_collection.find_one({"_id": ObjectId(studentId)})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Compress the image
    try:
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if it's RGBA or P to ensure JPEG compatibility
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
            
        # Optional: Resize if image is extremely large (e.g., max width/height 1600px)
        max_size = (1600, 1600)
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save compressed image to buffer
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=75, optimize=True)
        buffer.seek(0)
        
        compressed_data = buffer.read()
        content_type = "image/jpeg"
        filename = f"{file.filename.rsplit('.', 1)[0]}.jpg" if '.' in file.filename else f"{file.filename}.jpg"
        
    except Exception as e:
        # Fallback if image compression fails (e.g. not a valid image format)
        print(f"Image compression failed: {e}")
        await file.seek(0)
        compressed_data = await file.read()
        content_type = file.content_type
        filename = file.filename

    # Upload to GridFS
    grid_in = fs.open_upload_stream(
        filename,
        metadata={"contentType": content_type, "studentId": studentId}
    )
    
    await grid_in.write(compressed_data)
    await grid_in.close()

    file_id = str(grid_in._id)

    doc_dict = {
        "studentId": studentId,
        "name": name,
        "fileId": file_id,
        "url": f"http://127.0.0.1:8000/api/documents/file/{file_id}",
        "uploadedAt": datetime.utcnow()
    }
    
    new_doc = await documents_collection.insert_one(doc_dict)
    created_doc = await documents_collection.find_one({"_id": new_doc.inserted_id})
    return created_doc

@router.get("/file/{file_id}")
async def get_file(file_id: str):
    if not ObjectId.is_valid(file_id):
        raise HTTPException(status_code=400, detail="Invalid File ID")
    
    try:
        grid_out = await fs.open_download_stream(ObjectId(file_id))
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")

    async def file_sender():
        while True:
            chunk = await grid_out.readchunk()
            if not chunk:
                break
            yield chunk

    return StreamingResponse(
        file_sender(),
        media_type=grid_out.metadata.get("contentType", "application/octet-stream") if grid_out.metadata else "application/octet-stream"
    )

@router.get("/student/{student_id}", response_model=list[DocumentModel])
async def get_student_documents(student_id: str):
    if not ObjectId.is_valid(student_id):
        raise HTTPException(status_code=400, detail="Invalid Student ID")
        
    documents = await documents_collection.find({"studentId": student_id}).sort("uploadedAt", -1).to_list(100)
    return documents
