# **TechTrack – Job Search Management Platform**
### **Personal Project by Eden Oved**

**TechTrack** is a job search management platform designed to streamline the job search process in the tech industry. It features a dynamic list of companies with detailed information and job links, alongside robust resume management capabilities with version control. The platform integrates with a CSV file that works closely with a PostgreSQL database, allowing users to efficiently import, update, and manage company data.

---

## **Features**

### **Company Management**
- **Dynamic Company List**: Manage a list of companies with detailed job titles, locations, industries, and websites.
- **CSV Integration**: Import and sync company data from a CSV file, ensuring data consistency and operational efficiency with PostgreSQL.
- **Search Companies**: Search for companies based on job title, location, and other attributes.
- **Wikipedia Integration**: Fetch company details directly from Wikipedia using the company name.

### **Resume Management**
- **Upload Resumes**: Upload resumes and associate them with specific job titles or fields.
- **Version Control**: Manage multiple versions of resumes tailored to different job applications.
- **Download Resumes**: Download resumes in various formats (PDF, Word, or Text).
- **View Resumes**: Preview resume content directly in the browser.
- **Edit/Delete Resumes**: Update or delete resumes as needed.

---

## **Tech Stack**
- **FastAPI**: Backend framework used to handle API requests and business logic.
- **React & TypeScript**: Frontend technologies used for creating dynamic and responsive user interfaces.
- **PostgreSQL**: Relational database for storing company and resume data.
- **SQLAlchemy**: ORM used for interacting with the PostgreSQL database.
- **Pandas**: Python library used for handling and manipulating CSV data.
- **Wikipedia API**: Used to fetch company descriptions and details.

---

## **Setup Instructions**

### **Prerequisites**
- **Backend**: 
  - Python 3.x
  - PostgreSQL
- **Frontend**: 
  - npm (Node Package Manager)

### **Installation Steps**

1. **Backend Setup**:
   - Navigate to the `backend` directory:
     ```bash
     cd backend
     ```
   - Install the required Python packages:
     ```bash
     pip install -r requirements.txt
     ```
   - Set up PostgreSQL and configure the database connection in the `.env` file.

2. **Frontend Setup**:
   - Navigate to the `frontend` directory:
     ```bash
     cd frontend
     ```
   - Install frontend dependencies:
     ```bash
     npm install
     ```

3. **Running the Project**:
   - **Backend**: Start the FastAPI backend server:
     ```bash
     uvicorn main:app --reload
     ```
   - **Frontend**: Start the React frontend server:
     ```bash
     npm start
     ```

---

## **API Endpoints**

### **Company Management Endpoints**  
- `GET /companies`: Fetch the list of companies from the database.  
- `POST /companies`: Add a new company to the database.  
- `PUT /companies/{company_id}`: Update company details.  
- `DELETE /companies/{company_id}`: Delete a company from the database.  
- `POST /import-companies`: Upload a CSV file to import company data and synchronize it with the PostgreSQL database.

### **Resume Management Endpoints**  
- `GET /resumes`: Fetch a list of uploaded resumes.  
- `POST /resumes/upload`: Upload a new resume.  
- `PUT /resumes/{resume_id}`: Update an existing resume.  
- `DELETE /resumes/{resume_id}`: Delete a resume.  
- `GET /resumes/download/{filename}`: Download a resume by filename.

### **Wikipedia Integration**  
- `GET /company-details/{company_name}`: Fetch company details from Wikipedia by name.

---

## **How to Contribute**
Feel free to fork this repository, submit pull requests, or open issues if you encounter any bugs or have suggestions for improvements.

---

## **Contact**
- **Name**: Eden Oved
- **Email**: edenoved.swe@gmail.com 
- **LinkedIn**: [https://www.linkedin.com/in/edenoved/](https://www.linkedin.com/in/edenoved/)
 
