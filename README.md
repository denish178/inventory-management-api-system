# 📦 Inventory Management Tool – Backend APIs

A secure and scalable backend application to manage inventory for small businesses. This project provides RESTful APIs for authentication and inventory operations like adding products, updating quantities, and listing products.

---

## 🔧 Tech Stack

- **Framework:** FastAPI (Python)
- **Database:** SQLite (can be swapped for PostgreSQL)
- **Authentication:** JWT (via `python-jose`)
- **ORM:** SQLAlchemy
- **Docs:** Swagger/OpenAPI (auto-generated at `/docs`)

---

## 🚀 Features

- ✅ **User Authentication** with JWT
- ➕ **Add Products** with name, type, SKU, image URL, quantity, price, and description
- 🔁 **Update Product Quantity**
- 📦 **Get Products** with pagination
- 🔐 All product APIs are protected (JWT required)

---

## 📂 Folder Structure

inventory-api/
│
├── app/
│ ├── init.py
│ ├── main.py
│ ├── auth.py
│ ├── models.py
│ ├── schemas.py
│ ├── crud.py
│ ├── database.py
│ └── routes/
│ ├── init.py
│ ├── auth_routes.py
│ └── product_routes.py
│
├── test_api.py
├── requirements.txt
└── README.md


---

## 🛠️ Setup Instructions

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/your-username/inventory-api.git
cd inventory-api

2️⃣ Install Dependencies
pip install -r requirements.txt



3️⃣ Run the Server
uvicorn app.main:app --reload
Server will run at: http://localhost:8000

🔐 Authentication
First, POST /register with { username, password } to create a user.

Then, POST /login to receive JWT token.

Use the JWT token in Authorization: Bearer <token> header for all product-related APIs.

🧪 Run Test Script

python test_api.py
Make sure the server is running locally on http://localhost:8000 before running tests.

📑 API Docs
Visit: http://localhost:8000/docs

🐳 Docker (optional)
See next step for Dockerfile setup.

✨ Optional Features
Basic Analytics

Admin Portal

Frontend (React/Vue)

Dockerize the backend

👨‍💻 Author
Your Name – @yourhandle


---

## ✅ STEP 10: `Dockerfile`

Here’s how to Dockerize your FastAPI app:

### Create `Dockerfile` in root:

```Dockerfile
# Dockerfile

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Run the app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
Optional .dockerignore

__pycache__/
*.pyc
.env
*.db

Build and Run Docker Container

docker build -t inventory-api .
docker run -p 8000:8000 inventory-api
Your app will now be running at http://localhost:8000