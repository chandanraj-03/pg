import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

client = AsyncIOMotorClient(MONGODB_URL)
database = client.pg_management

# GridFS Bucket
fs = AsyncIOMotorGridFSBucket(database)

# Collections
users_collection = database.get_collection("users")
students_collection = database.get_collection("students")
documents_collection = database.get_collection("documents")
payments_collection = database.get_collection("payments")
expenses_collection = database.get_collection("expenses")
