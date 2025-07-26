from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter()

@router.post("/products", response_model=schemas.ProductOut, status_code=201)
def add_product(product: schemas.ProductBase, db: Session = Depends(get_db), user: models.User = Depends(auth.verify_token)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/products/{product_id}/quantity")
def update_quantity(product_id: int, update: schemas.QuantityUpdate, db: Session = Depends(get_db), user: models.User = Depends(auth.verify_token)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.quantity = update.quantity
    db.commit()
    return {"message": "Quantity updated", "quantity": product.quantity}

@router.get("/products", response_model=list[schemas.ProductOut])
def get_products(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), user: models.User = Depends(auth.verify_token)):
    return db.query(models.Product).offset(skip).limit(limit).all()
