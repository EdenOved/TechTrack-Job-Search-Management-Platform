# TechTrack – Job Search Management Platform
## Personal Project By Eden Ovad

TechTrack is a **Job Search Management Platform** designed to streamline the job search process in the tech industry. It features a dynamic list of companies with detailed information and job links, alongside powerful resume management with version control. The platform integrates a CSV file that works closely with the PostgreSQL database, allowing users to import, update, and manage company data efficiently.

## Features

### Company Management
- **Dynamic Company List**: Manage a list of companies with details such as job title, location, industry, and website.
- **CSV Integration**: Import and sync company data from a CSV file, working closely with the PostgreSQL database to ensure consistency and efficiency.
- **Search Companies**: Search for companies based on job title, location, and other attributes.
- **Wikipedia Integration**: Fetch company details from Wikipedia by name.

### Resume Management
- **Upload Resumes**: Upload resumes and link them with specific job titles and fields.
- **Version Control**: Maintain multiple versions of resumes for different job applications.
- **Download Resumes**: Download resumes in PDF, Word, or text format.
- **View Resumes**: Preview the content of resumes directly in the browser.
- **Edit and Delete Resumes**: Update or delete resumes as needed.

## Tech Stack

- **FastAPI**: Backend framework for handling API requests and business logic.
- **React** & **TypeScript**: Frontend technologies for dynamic user interfaces.
- **PostgreSQL**: Relational database used for storing company and resume data.
- **SQLAlchemy**: ORM for interacting with the PostgreSQL database.
- **Pandas**: Python library for CSV data handling and manipulation.
- **Wikipedia API**: For fetching company descriptions and details.

## Setup Instructions

### Prerequisites
### backend init

- **Python 3.x**: Backend dependencies.
- **PostgreSQL**: Running PostgreSQL database instance.
- **npm**: Node package manager for frontend dependencies.

### frontend init
- cd frontend
- npm install
- cd ..

### API Endpoints
### Company Management Endpoints
- GET /companies: Fetch the list of companies from the database.
- POST /companies: Add a new company to the database.
- PUT /companies/{company_id}: Update an existing company's -details.
- DELETE /companies/{company_id}: Remove a company from the database.
- POST /import-companies: Upload a CSV file to import company data. The CSV file works closely with the PostgreSQL database to ensure data synchronization.
Resume Management Endpoints
- GET /resumes: Fetch a list of uploaded resumes.
- POST /resumes/upload: Upload a new resume.
- PUT /resumes/{resume_id}: Update an existing resume.
- DELETE /resumes/{resume_id}: Delete a resume.
- GET /resumes/download/{filename}: Download a resume by filename.
Wikipedia Integration
- GET /company-details/{company_name}: Fetch company details from Wikipedia by name.