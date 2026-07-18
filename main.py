from fastapi import FastAPI
import models
from database import Base, engine, get_db
from routers import auth,bookmarks, packages

models.Base.metadata.create_all(bind=engine)
app= FastAPI()
app.include_router(auth.router,prefix="/auth",tags=["auth"])
app.include_router(bookmarks.app,prefix="/bookmarks",tags=["Bookmark"])
app.include_router(packages.router,prefix="/packages",tags=["Package"])

@app.get("/")
def home():
    return {"message" : "Hello WORLD"}