from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr, HttpUrl
import uuid


class UserBase(BaseModel):
    email: EmailStr = Field(max_length=120)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=20)


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str


# BOOKMARKS


class BookmarkBase(BaseModel):
    title: str = Field(min_length=1, max_length=20)
    url: HttpUrl
    description: str | None = Field(default=None, max_length=200)


class BookmarkCreate(BookmarkBase):
    pass


class BookmarkUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=20)
    url: HttpUrl | None = Field(default=None)
    description: str | None = Field(default=None, max_length=200)

class BookmarkResponse(BookmarkBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    created_at: datetime

#PACKAGES

class PackageBase(BaseModel):
    name:str

class PackageUpdate(BaseModel):
    name:str
class PackageCreate(PackageBase):
    pass

class PackageResponse(PackageBase):
    model_config = ConfigDict(from_attributes=True)
    id:str
    user_id:str
    created_at:datetime