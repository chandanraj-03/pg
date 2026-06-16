from fastapi import APIRouter, HTTPException, status
from models import StudentModel, StudentCreate
from database import students_collection, payments_collection, documents_collection
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=StudentModel, status_code=status.HTTP_201_CREATED)
async def create_student(student: StudentCreate):
    student_dict = student.dict()
    new_student = await students_collection.insert_one(student_dict)
    created_student = await students_collection.find_one({"_id": new_student.inserted_id})
    return created_student

@router.get("/", response_model=list[StudentModel])
async def list_students():
    students = await students_collection.find().to_list(1000)
    return students

@router.get("/{id}", response_model=StudentModel)
async def get_student(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    student = await students_collection.find_one({"_id": ObjectId(id)})
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.patch("/{id}/rent-status")
async def update_rent_status(id: str, status: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    if status not in ["Paid", "Unpaid"]:
        raise HTTPException(status_code=400, detail="Status must be Paid or Unpaid")
    
    update_result = await students_collection.update_one(
        {"_id": ObjectId(id)}, {"$set": {"rentStatus": status}}
    )
    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found or status already set")
    return {"message": "Rent status updated successfully"}

@router.put("/{id}", response_model=StudentModel)
async def update_student(id: str, student: StudentCreate):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    student_dict = student.dict()
    update_result = await students_collection.update_one(
        {"_id": ObjectId(id)}, {"$set": student_dict}
    )
    
    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
        
    updated_student = await students_collection.find_one({"_id": ObjectId(id)})
    return updated_student

@router.delete("/{id}")
async def delete_student(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    delete_result = await students_collection.delete_one({"_id": ObjectId(id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Cascade delete associated records
    await payments_collection.delete_many({"studentId": id})
    await documents_collection.delete_many({"studentId": id})
    
    return {"message": "Student and associated records deleted successfully"}

@router.post("/reset-rent")
async def reset_rent_status():
    update_result = await students_collection.update_many(
        {"status": {"$ne": "Left"}}, {"$set": {"rentStatus": "Unpaid"}}
    )
    return {"message": f"Rent reset for {update_result.modified_count} active students."}

@router.patch("/{id}/status")
async def update_status(id: str, status: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    if status not in ["Active", "Left"]:
        raise HTTPException(status_code=400, detail="Status must be Active or Left")
    
    update_result = await students_collection.update_one(
        {"_id": ObjectId(id)}, {"$set": {"status": status}}
    )
    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found or status already set")
    return {"message": "Student status updated successfully"}
