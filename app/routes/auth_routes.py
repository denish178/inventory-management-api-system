from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login(data: schemas.LoginSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user or not bcrypt.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_token(user.username)
    return {"access_token": token, "token_type": "bearer"}




@router.post("/register", status_code=201)
def register(data: schemas.LoginSchema, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == data.username).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")
    hashed_password = bcrypt.hash(data.password)
    user = models.User(username=data.username, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created successfully", "user_id": user.id}

