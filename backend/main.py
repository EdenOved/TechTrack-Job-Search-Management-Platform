from resumes import router
from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from typing import List
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import requests
import os
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv


load_dotenv()
# Database configuration
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLAlchemy Company model


class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_name = Column(String, index=True)
    location = Column(String)
    industry = Column(String)
    website = Column(String)


# Create tables in the database
Base.metadata.create_all(bind=engine)

# Pydantic models for API


class CompanyCreate(BaseModel):
    company_name: str
    location: str
    industry: str
    website: str


class CompanyResponse(CompanyCreate):
    id: int

# Dependency to get DB session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CRUD routes
CSV_FILE_PATH = 'companies.csv'


def add_companies_from_csv_to_db(db: Session, file_path: str):
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="CSV file not found")

    df = pd.read_csv(file_path)

    for index, row in df.iterrows():
        existing_company = db.query(Company).filter(
            Company.id == row['id']).first()

        if existing_company:
            existing_company.company_name = row['company_name']
            existing_company.location = row['location']
            existing_company.industry = row['industry']
            existing_company.website = row['website']
        else:
            new_company = Company(
                id=row['id'],
                company_name=row['company_name'],
                location=row['location'],
                industry=row['industry'],
                website=row['website']
            )
            db.add(new_company)

    db.commit()


def read_companies_from_csv(file_path: str) -> List[CompanyResponse]:
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="CSV file not found")

    df = pd.read_csv(file_path)
    companies_from_csv = []
    for index, row in df.iterrows():
        companies_from_csv.append(CompanyResponse(
            id=row['id'],
            company_name=row['company_name'],
            location=row['location'],
            industry=row['industry'],
            website=row['website']
        ))
    return companies_from_csv


@app.get("/companies", response_model=List[CompanyResponse])
def get_companies(db: Session = Depends(get_db)):
    csv_file_path = CSV_FILE_PATH
    add_companies_from_csv_to_db(db, csv_file_path)

    companies_from_db = db.query(Company).all()
    companies_from_db_response = [
        CompanyResponse(
            id=company.id,
            company_name=company.company_name,
            location=company.location,
            industry=company.industry,
            website=company.website
        )
        for company in companies_from_db
    ]

    return companies_from_db_response


@app.post("/companies", response_model=CompanyResponse)
def add_company(company: CompanyCreate, db: Session = Depends(get_db)):
    print("Received company data:", company.model_dump())

    # מציאת ה-id הגבוה ביותר במסד הנתונים
    max_id = db.query(Company.id).order_by(Company.id.desc()).first()
    new_id = 1  # במקרה שאין רשומות, ה-id הראשון יהיה 1

    if max_id is not None:
        new_id = max_id[0] + 1  # מגדיל את ה-id הקיים הגדול ביותר ב-1

    # יצירת החברה החדשה עם ה-id החדש
    new_company = Company(
        id=new_id,
        company_name=company.company_name,
        location=company.location,
        industry=company.industry,
        website=company.website
    )

    try:
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        print("Company added successfully:", new_company.id)
    except IntegrityError as e:
        db.rollback()
        error_message = str(e.orig)
        print("IntegrityError occurred:", error_message)
        raise HTTPException(
            status_code=500, detail="An error occurred: " + error_message)
    except Exception as e:
        db.rollback()
        print("General Exception occurred:", str(e))
        raise HTTPException(
            status_code=500, detail="An error occurred: " + str(e))

    return new_company


@app.delete("/companies/{company_id}", response_model=CompanyResponse)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    db.delete(company)
    db.commit()

    if os.path.exists(CSV_FILE_PATH):
        df = pd.read_csv(CSV_FILE_PATH)
        df = df[df['id'] != company_id]
        df.to_csv(CSV_FILE_PATH, index=False)

    return company


@app.put("/companies/{company_id}", response_model=CompanyResponse)
def update_company(company_id: int, company: CompanyCreate, db: Session = Depends(get_db)):
    existing_company = db.query(Company).filter(
        Company.id == company_id).first()
    if not existing_company:
        raise HTTPException(status_code=404, detail="Company not found")

    for key, value in company.dict().items():
        setattr(existing_company, key, value)

    db.commit()
    db.refresh(existing_company)

    if os.path.exists(CSV_FILE_PATH):
        df = pd.read_csv(CSV_FILE_PATH)
        df.loc[df['id'] == company_id, ['company_name', 'location', 'industry', 'website']] = [
            existing_company.company_name, existing_company.location, existing_company.industry, existing_company.website
        ]
        df.to_csv(CSV_FILE_PATH, index=False)

    return existing_company


@app.post("/import-companies")
async def import_companies(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Please upload a CSV file.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))

        for _, row in df.iterrows():
            company_name = row.get('company_name')
            location = row.get('location')
            industry = row.get('industry')
            website = row.get('website')

            if not all([company_name, location, industry, website]):
                continue

            company = db.query(Company).filter(
                Company.company_name == company_name).first()

            if company:
                company.location = location
                company.industry = industry
                company.website = website
            else:
                new_company = Company(
                    company_name=company_name,
                    location=location,
                    industry=industry,
                    website=website
                )
                db.add(new_company)

        db.commit()
        return {"detail": "Companies imported successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# New endpoint to fetch company information from Wikipedia by name
WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php'


@app.get("/company-details/{company_name}")
async def get_company_details(company_name: str):
    params = {
        'action': 'query',
        'format': 'json',
        'titles': company_name,
        'prop': 'extracts|pageimages',
        'exintro': True,
        'explaintext': True,
        'pithumbsize': 500
    }
    response = requests.get(WIKIPEDIA_API_URL, params=params)
    data = response.json()

    pages = data.get('query', {}).get('pages', {})
    if not pages:
        raise HTTPException(
            status_code=404, detail="Company details not found")

    page = next(iter(pages.values()))
    if 'missing' in page:
        raise HTTPException(
            status_code=404, detail="Company details not found")

    extract = page.get('extract', 'No description available')
    thumbnail = page.get('thumbnail', {}).get('source', '')

    return {
        'company_name': company_name,
        'description': extract,
        'thumbnail': thumbnail
    }

# Static files for file uploads
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Include resume router (assuming it is defined elsewhere)
app.include_router(router)
