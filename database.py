from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

SQLALCHEMY_DATABASE_URL = ""

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)

SessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    with SessionLocal() as session:
        yield session
