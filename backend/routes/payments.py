from fastapi import APIRouter, HTTPException, status
from models import PaymentModel, PaymentCreate
from database import payments_collection, students_collection
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=PaymentModel, status_code=status.HTTP_201_CREATED)
async def record_payment(payment: PaymentCreate):
    payment_dict = payment.dict()
    
    if not ObjectId.is_valid(payment.studentId):
        raise HTTPException(status_code=400, detail="Invalid Student ID")
        
    student = await students_collection.find_one({"_id": ObjectId(payment.studentId)})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    existing_payment = await payments_collection.find_one({
        "studentId": payment.studentId,
        "month": payment.month
    })
    
    if existing_payment:
        await payments_collection.update_one(
            {"_id": existing_payment["_id"]},
            {"$set": {"amount": payment.amount, "datePaid": payment.datePaid}}
        )
        created_payment = await payments_collection.find_one({"_id": existing_payment["_id"]})
    else:
        new_payment = await payments_collection.insert_one(payment_dict)
        created_payment = await payments_collection.find_one({"_id": new_payment.inserted_id})
    
    await students_collection.update_one(
        {"_id": ObjectId(payment.studentId)},
        {"$set": {
            "rentStatus": "Paid",
            "lastPaidDate": payment.datePaid
        }}
    )
    
    return created_payment

@router.get("/student/{student_id}", response_model=list[PaymentModel])
async def get_student_payments(student_id: str):
    if not ObjectId.is_valid(student_id):
        raise HTTPException(status_code=400, detail="Invalid Student ID")
        
    payments = await payments_collection.find({"studentId": student_id}).sort("datePaid", -1).to_list(1000)
    return payments

@router.get("/ledger/{year}", response_model=list[PaymentModel])
async def get_yearly_ledger(year: str):
    # Find all payments where the 'month' string contains the year (e.g. "June 2026")
    payments = await payments_collection.find({"month": {"$regex": year}}).to_list(10000)
    return payments
