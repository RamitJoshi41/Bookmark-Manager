from fastapi import FastAPI
import models
from database import Base, engine, get_db
from routers import auth

models.Base.metadata.create_all(bind=engine)
app= FastAPI()
app.include_router(auth.router,prefix="/auth",tags=["auth"])

@app.get("/")
def home():
    return {"message" : "Hello WORLD"}