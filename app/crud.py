from sqlalchemy.orm import Session
from . import models, schemas
from passlib.hash import bcrypt

# -------------------------
# User-related operations
# -------------------------
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, username: str, password: str):
    hashed_password = bcrypt.hash(password)
    user = models.User(username=username, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# -------------------------
# Product-related operations
# -------------------------
def create_product(db: Session, product: schemas.ProductBase):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product_quantity(db: Session, product_id: int, new_quantity: int):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product:
        product.quantity = new_quantity
        db.commit()
        db.refresh(product)
    return product

def get_products(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Product).offset(skip).limit(limit).all()
