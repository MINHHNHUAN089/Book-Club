from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import auth, books, reviews, groups, challenges, authors

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Book Club API",
    description="API for Book Club / Reading Tracker application",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(books.router)
app.include_router(reviews.router)
app.include_router(groups.router)
app.include_router(challenges.router)
app.include_router(authors.router)


@app.get("/")
def root():
    return {
        "message": "Book Club API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}

