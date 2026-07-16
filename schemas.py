from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr
import uuid

class UserBase(BaseModel):
    email: EmailStr = Field(max_length=120)

class UserCreate(UserBase):
    password: str = Field(min_length=8,max_length=20)

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str 
    created_at: datetime

class Token(BaseModel):
    access_token:str
    token_type: str
