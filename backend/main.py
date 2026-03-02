from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import register, upload, match

app = FastAPI(title="WeddingSnap API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(register.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(match.router, prefix="/api")

@app.get("/")
def root():
    return {"message": "WeddingSnap API is running!"}