from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, students, dashboard, payments, documents, expenses

app = FastAPI(title="PG Management API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(expenses.router, prefix="/api/expenses", tags=["Expenses"])

@app.get("/")
def root():
    return {"message": "Welcome to PG Management API"}
