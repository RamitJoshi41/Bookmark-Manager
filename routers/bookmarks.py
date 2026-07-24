from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, Session

import models
from database import get_db
from schemas import BookmarkCreate, BookmarkResponse, BookmarkUpdate

from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
from auth import (
    CurrentUser,
)

app = APIRouter()


@app.post(
    "/create",
    response_model=BookmarkResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_bookmark(
    bookmark: BookmarkCreate, user: CurrentUser, db: Annotated[Session, Depends(get_db)]
):
    # check if already bookmark made
    result = db.execute(
        select(models.Bookmark)
        .where(models.Bookmark.user_id == user.id)
        .where(func.lower(models.Bookmark.url) == str(bookmark.url).lower()),
    )
    existing_bookmark = result.scalars().first()
    if existing_bookmark:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bookmark already exists",
        )
    # create new bookmark
    new_bookmark = models.Bookmark(
        user_id=user.id,
        title=bookmark.title,
        url=str(bookmark.url),
        description=bookmark.description,
    )

    db.add(new_bookmark)
    db.commit()
    db.refresh(new_bookmark)
    return new_bookmark


@app.get("/", response_model=list[BookmarkResponse])
def get_bookmark(
    user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    search: str | None = None,
):
    query = select(models.Bookmark).where(models.Bookmark.user_id == user.id)

    if search:
        query = query.where(
            or_(
                models.Bookmark.title.ilike(f"%{search}%"),
                models.Bookmark.url.ilike(f"%{search}%"),
            )
        )

    result = db.execute(query)
    return result.scalars().all()


@app.delete("/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bookmark(
    user: CurrentUser,bookmark_id :str, db: Annotated[Session, Depends(get_db)]
):
    query = (
        select(models.Bookmark)
        .where(models.Bookmark.user_id == user.id)
        .where(models.Bookmark.id == bookmark_id)
    )

    to_delete_bookmark = db.execute(query).scalars().first()
    if not to_delete_bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found"
        )
    db.delete(to_delete_bookmark)
    db.commit()


@app.patch("/update/{bookmark_id}", response_model=BookmarkResponse)
def update_bookmark(
    bookmark_id: str,
    user: CurrentUser,
    bookmark: BookmarkUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    query = (
        select(models.Bookmark)
        .where(models.Bookmark.user_id == user.id)
        .where(models.Bookmark.id == bookmark_id)
    )

    to_update_bookmark = db.execute(query).scalars().first()
    if not to_update_bookmark:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found"
        )
    update_data = bookmark.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "url":
             setattr(to_update_bookmark, field, str(value))
        else:
             setattr(to_update_bookmark, field, value)
    db.commit()
    db.refresh(to_update_bookmark)
    return to_update_bookmark
