from fastapi import APIRouter, HTTPException, status
from models import ExpenseModel, ExpenseCreate
from database import expenses_collection
from bson import ObjectId
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=ExpenseModel, status_code=status.HTTP_201_CREATED)
async def create_expense(expense: ExpenseCreate):
    expense_dict = expense.dict()
    new_expense = await expenses_collection.insert_one(expense_dict)
    created_expense = await expenses_collection.find_one({"_id": new_expense.inserted_id})
    return created_expense

@router.get("/", response_model=list[ExpenseModel])
async def list_expenses():
    expenses = await expenses_collection.find().sort("dateIncurred", -1).to_list(1000)
    return expenses

@router.get("/{id}", response_model=ExpenseModel)
async def get_expense(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    expense = await expenses_collection.find_one({"_id": ObjectId(id)})
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.delete("/{id}")
async def delete_expense(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    delete_result = await expenses_collection.delete_one({"_id": ObjectId(id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}
