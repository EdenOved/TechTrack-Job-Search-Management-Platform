import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CompanyTable from './components/CompanyTable'; // עדכון הייבוא של הקומפוננטה
import CompanyDetails from './components/CompanyDetails'; // עדכון הייבוא של פרטי חברה
import ResumeManager from './components/ResumeManager'; // עדכון הייבוא של ניהול קורות חיים

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<CompanyTable />} /> {/* עמוד טבלת החברות */}
      <Route path="/company-details/:companyName" element={<CompanyDetails />} /> {/* עמוד פרטי חברה */}
      <Route path="/resumes" element={<ResumeManager />} /> {/* עמוד ניהול קורות חיים */}
    </Routes>
  );
};

export default App;
