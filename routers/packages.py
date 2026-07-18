from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, Session

import models
from database import get_db
from schemas import (
    BookmarkResponse,
    PackageCreate,
    PackageResponse,
)

from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
from auth import (
    CurrentUser,
)

router = APIRouter()


@router.post(
    "/create", response_model=PackageResponse, status_code=status.HTTP_201_CREATED
)
def create_package(
    user: CurrentUser, package: PackageCreate, db: Annotated[Session, Depends(get_db)]
):

    query = (
        select(models.Package)
        .where(models.Package.user_id == user.id)
        .where(models.Package.name == package.name)
    )

    result = db.execute(query).scalars().first()

    if result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Package already exists"
        )

    new_package = models.Package(user_id=user.id, name=package.name)

    db.add(new_package)
    db.commit()
    db.refresh(new_package)
    return new_package


@router.get("/", response_model=list[PackageResponse])
def get_packages(
    user: CurrentUser, db: Annotated[Session, Depends(get_db)], search: str | None = None
):
    query = select(models.Package).where(models.Package.user_id == user.id)

    if search:
        query = query.where(
            models.Package.name.ilike(f"%{search}%"),
        )

    result = db.execute(query)
    return result.scalars().all()


@router.post("/{package_id}/bookmarks")
def add_bookmarks(
    user: CurrentUser,
    package_id: str,
    bookmark_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    # 1. Fetch the Package
    query = select(models.Package).where(models.Package.user_id == user.id)
    package = db.execute(query.where(models.Package.id == package_id)).scalars().first()

    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Package does not exist"
        )

    # 2. Check if the bookmark is ALREADY in the package (Python list check)
    for b in package.bookmarks:
        if b.id == bookmark_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Bookmark already exists in this package"
            )

    # 3. Fetch the bookmark from the database to ensure it's real and owned by user
    new_bookmark = db.execute(
        select(models.Bookmark)
        .where(models.Bookmark.user_id == user.id)
        .where(models.Bookmark.id == bookmark_id)
    ).scalars().first()

    # 4. TYPE NARROWING FIX: Ensure new_bookmark isn't None before appending
    if not new_bookmark:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark does not exist"
        )

    # 5. Append and Save
    package.bookmarks.append(new_bookmark)
    db.commit()
    # Good practice to return a message on successful POSTs if no response_model is defined
    return {"message": "Bookmark added successfully"}


@router.get('/{package_id}/bookmarks', response_model=list[BookmarkResponse])
def get_package_bookmarks(
    user: CurrentUser,
    package_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    query = select(models.Package).where(models.Package.user_id == user.id)
    package = db.execute(query.where(models.Package.id == package_id)).scalars().first()

    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Package does not exist"
        )
    
    return package.bookmarks


@router.delete('/{package_id}/bookmarks/{bookmark_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_package_bookmark(
    user: CurrentUser, 
    package_id: str, 
    bookmark_id: str,
    db: Annotated[Session, Depends(get_db)]
):
    # 1. Fetch the Package
    query = select(models.Package).where(models.Package.user_id == user.id)
    package = db.execute(query.where(models.Package.id == package_id)).scalars().first()

    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Package does not exist"
        )

    # 2. Find the exact bookmark in the package's relationship list
    bookmark_to_remove = None
    for b in package.bookmarks:
        if b.id == bookmark_id:
            bookmark_to_remove = b
            break # Stop looking once we find it

    # 3. If we didn't find it in the loop, it's not in the package
    if not bookmark_to_remove:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found in package"
        )
    
    # 4. Remove the specific object and commit
    package.bookmarks.remove(bookmark_to_remove)
    db.commit()
    return None

@router.delete('/{package_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_package(
    user: CurrentUser, 
    package_id: str, 
    db: Annotated[Session, Depends(get_db)]
):
    # 1. Fetch the Package
    query = select(models.Package).where(models.Package.user_id == user.id)
    package = db.execute(query.where(models.Package.id == package_id)).scalars().first()

    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Package does not exist"
        )

    
    db.delete(package)
    db.commit()
    return None
