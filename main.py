from fastapi import FastAPI
import models
from database import Base, engine, get_db

models.Base.metadata.create_all(bind=engine)
app= FastAPI()

@app.get("/")
def home():
    return {"message" : "Hello WORLD"}