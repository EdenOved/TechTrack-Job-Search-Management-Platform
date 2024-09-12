from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel
from typing import List
import os
import shutil
import uuid
from sqlalchemy import Column, String
from sqlalchemy.orm import Session
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv


router = APIRouter()


load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


UPLOAD_DIRECTORY = 'uploads'
if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)


class ResumeBase(BaseModel):
    job_title: str
    field: str
    filename: str
    url: str

    class Config:
        from_attributes = True


class ResumeCreate(ResumeBase):
    pass


class ResumeResponse(ResumeBase):
    id: str


class Resume(Base):
    __tablename__ = "resumes"
    id = Column(String, primary_key=True, index=True)
    job_title = Column(String)
    field = Column(String)
    filename = Column(String)
    url = Column(String)


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/resumes", response_model=List[ResumeResponse])
def get_resumes(db: Session = Depends(get_db)):
    resumes = db.query(Resume).all()
    return resumes


@router.post("/resumes/upload", response_model=ResumeResponse)
async def upload_resume(
    job_title: str = Form(...),
    field: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    resume_id = str(uuid.uuid4())  # Generate unique ID for each resume
    filename = f"{resume_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIRECTORY, filename)

    # Save the file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error saving file: {str(e)}")

    # Create URL for the file
    file_url = f"http://localhost:8000/uploads/{filename}"

    # Add the resume to the database
    new_resume = Resume(id=resume_id, job_title=job_title,
                        field=field, filename=filename, url=file_url)
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return new_resume


@router.put("/resumes/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: str,
    job_title: str = Form(...),
    field: str = Form(...),
    file: UploadFile = File(None),  # File is optional for updates
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume.job_title = job_title
    resume.field = field

    if file:
        filename = f"{resume_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIRECTORY, filename)
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error saving file: {str(e)}")

        resume.filename = filename
        resume.url = f"http://localhost:8000/uploads/{filename}"

    db.commit()
    db.refresh(resume)

    return resume


@router.delete("/resumes/{resume_id}", response_model=ResumeResponse)
def delete_resume(resume_id: str, db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    file_path = os.path.join(UPLOAD_DIRECTORY, resume.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(resume)
    db.commit()

    return resume


@router.get("/resumes/download/{filename}", response_class=FileResponse)
def download_file(filename: str):
    file_path = os.path.join(UPLOAD_DIRECTORY, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type='application/octet-stream', filename=filename)


# Serve uploaded files
router.mount("/uploads", StaticFiles(directory=UPLOAD_DIRECTORY),
             name="uploads")
