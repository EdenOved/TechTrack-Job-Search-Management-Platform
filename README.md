# **TechTrack – Job Search Management Platform**
### **Personal Project by Eden Oved**

**TechTrack** is a comprehensive job search management platform tailored for the tech industry, streamlining company research and resume management with ease and efficiency. It features a dynamic list of companies with detailed information and job links, alongside robust resume management capabilities with version control. The platform integrates with a CSV file that works closely with a PostgreSQL database, allowing users to efficiently import, update, and manage company data.

---

## **Features**

### **Company Management**
- 📄 **Dynamic Company List**: Manage a list of companies with detailed job titles, locations, industries, and websites.
- 📂 **CSV Integration**: Import and sync company data from a CSV file, ensuring data consistency and operational efficiency with PostgreSQL.
- 🔍 **Search Companies**: Search for companies based on job title, location, and other attributes.
- 🌐 **Wikipedia Integration**: Fetch company details directly from Wikipedia using the company name.

### **Resume Management**
- 📤 **Upload Resumes**: Upload resumes and associate them with specific job titles or fields.
- 📝 **Version Control**: Manage multiple versions of resumes tailored to different job applications.
- 📥 **Download Resumes**: Download resumes in various formats (PDF, Word, or Text).
- 👀 **View Resumes**: Preview resume content directly in the browser.
- ✏️ **Edit/Delete Resumes**: Update or delete resumes as needed.

---

## **Tech Stack**
- **FastAPI**: Backend framework used to handle API requests and business logic.
- **React & TypeScript**: Modern frontend for dynamic, responsive interfaces.
- **PostgreSQL**: Relational database optimized for complex queries and data integrity.
- **SQLAlchemy**: ORM used for interacting with the PostgreSQL database.
- **Pandas**: Python library for handling and manipulating CSV data.
- **Wikipedia API**: Fetches company descriptions and details.

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
   - **Important**: Configure your database connection string in the `.env` file (refer to `.env.example` for the required variables).

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
  - **Example**:
    ```json
    {
      "name
