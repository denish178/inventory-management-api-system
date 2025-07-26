from fastapi import FastAPI
from .database import Base, engine
from .routes import auth_routes, product_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory Management System")

app.include_router(auth_routes.router)
app.include_router(product_routes.router)
