from __future__ import annotations

from datetime import timezone, datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Table,
    Column,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from database import Base

UTC = timezone.utc

package_bookmarks = Table(
    "package_bookmarks",
    Base.metadata,
    Column("package_id", ForeignKey("packages.id"), primary_key=True),
    Column("bookmark_id", ForeignKey("bookmarks.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    # username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    bookmarks: Mapped[list["Bookmark"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    packages: Mapped[list["Package"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )


class Bookmark(Base):
    __tablename__ = "bookmarks"
    __table_args__ = (
        UniqueConstraint("user_id", "title", name="uid_user_bookmark_title"),
        UniqueConstraint("user_id", "url", name="uid_user_bookmark_url"),
    )

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(50), nullable=False)
    # tag: Mapped[str] = mapped_column(String(20), nullable=True)
    url: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    owner: Mapped["User"] = relationship(back_populates="bookmarks")
    packages: Mapped[list["Package"]] = relationship(
        secondary=package_bookmarks, back_populates="bookmarks"
    )


class Package(Base):
    __tablename__ = "packages"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uix_user_package_name"),
    )

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    owner: Mapped["User"] = relationship(back_populates="packages")

    bookmarks: Mapped[list["Bookmark"]] = relationship(
        secondary=package_bookmarks, back_populates="packages"
    )
