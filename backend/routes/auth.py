from fastapi import APIRouter, HTTPException, status
from models import UserCreate, UserLogin, Token
from database import users_collection
from auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }
    await users_collection.insert_one(new_user)
    return {"message": "User registered successfully"}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

from fastapi import Depends
from auth import get_current_user
from models import UpdateProfile, ChangePassword

@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "name": current_user.get("name"),
        "email": current_user.get("email")
    }

@router.put("/profile")
async def update_profile(profile: UpdateProfile, current_user: dict = Depends(get_current_user)):
    # If email is changing, check if new email exists
    if profile.email != current_user.get("email"):
        existing_user = await users_collection.find_one({"email": profile.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already taken")
    
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"name": profile.name, "email": profile.email}}
    )
    return {"message": "Profile updated successfully"}

@router.put("/password")
async def update_password(passwords: ChangePassword, current_user: dict = Depends(get_current_user)):
    if not verify_password(passwords.currentPassword, current_user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    hashed_password = get_password_hash(passwords.newPassword)
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password": hashed_password}}
    )
    return {"message": "Password updated successfully"}
