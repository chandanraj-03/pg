from pydantic import BaseModel, Field, EmailStr, GetCoreSchemaHandler
from datetime import datetime
from pydantic_core import core_schema
from typing import Optional, List, Any
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(
            cls, _source_type: Any, _handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class StudentModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    room: str
    phone: str
    fatherPhone: str
    occupationType: str
    instituteName: str
    rent: int
    rentStatus: str = "Paid"
    lastPaidDate: Optional[datetime] = None
    permanentAddress: str = ""
    joiningDate: Optional[datetime] = None
    status: str = "Active"

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class StudentCreate(BaseModel):
    name: str
    room: str
    phone: str
    fatherPhone: str
    occupationType: str
    instituteName: str
    rent: int
    rentStatus: str = "Unpaid"
    lastPaidDate: Optional[datetime] = None
    permanentAddress: str = ""
    joiningDate: Optional[datetime] = None
    status: str = "Active"

class DocumentModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    studentId: str
    name: str
    url: str
    fileId: Optional[str] = None
    uploadedAt: datetime

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class PaymentCreate(BaseModel):
    studentId: str
    amount: int
    month: str
    datePaid: datetime

class PaymentModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    studentId: str
    amount: int
    month: str
    datePaid: datetime

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class ExpenseCreate(BaseModel):
    category: str
    amount: int
    description: str
    dateIncurred: datetime

class ExpenseModel(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    category: str
    amount: int
    description: str
    dateIncurred: datetime

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }

class UpdateProfile(BaseModel):
    name: str
    email: EmailStr

class ChangePassword(BaseModel):
    currentPassword: str
    newPassword: str
