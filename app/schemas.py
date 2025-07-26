from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginSchema(BaseModel):
    username: str
    password: str

class ProductBase(BaseModel):
    name: str
    type: str
    sku: str
    image_url: str
    description: str
    quantity: int
    price: float

class ProductOut(ProductBase):
    id: int
    class Config:
        orm_mode = True

class QuantityUpdate(BaseModel):
    quantity: int

