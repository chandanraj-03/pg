from fastapi import APIRouter
from database import students_collection, payments_collection, expenses_collection
from datetime import datetime

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats():
    total_students = await students_collection.count_documents({"status": {"$ne": "Left"}})
    paid_students = await students_collection.count_documents({"status": {"$ne": "Left"}, "rentStatus": "Paid"})
    unpaid_students = await students_collection.count_documents({"status": {"$ne": "Left"}, "rentStatus": "Unpaid"})
    
    now = datetime.utcnow()
    start_of_today = datetime(now.year, now.month, now.day)
    start_of_month = datetime(now.year, now.month, 1)

    today_pipeline = [
        {"$match": {"datePaid": {"$gte": start_of_today}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    
    month_pipeline = [
        {"$match": {"datePaid": {"$gte": start_of_month}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    
    today_cursor = payments_collection.aggregate(today_pipeline)
    today_result = await today_cursor.to_list(1)
    collected_today = today_result[0]["total"] if today_result else 0
    
    month_cursor = payments_collection.aggregate(month_pipeline)
    month_result = await month_cursor.to_list(1)
    collected_this_month = month_result[0]["total"] if month_result else 0
    expense_month_pipeline = [
        {"$match": {"dateIncurred": {"$gte": start_of_month}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    expense_month_cursor = expenses_collection.aggregate(expense_month_pipeline)
    expense_month_result = await expense_month_cursor.to_list(1)
    expenses_this_month = expense_month_result[0]["total"] if expense_month_result else 0
    
    net_profit_this_month = collected_this_month - expenses_this_month
        
    return {
        "totalStudents": total_students,
        "paidStudents": paid_students,
        "unpaidStudents": unpaid_students,
        "collectedThisMonth": collected_this_month,
        "collectedToday": collected_today,
        "expensesThisMonth": expenses_this_month,
        "netProfitThisMonth": net_profit_this_month
    }
