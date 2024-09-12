import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Table, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import '../css/ResumeManagement.css';

interface Resume {
  id: string;
  job_title: string;
  field: string;
  filename: string;
  url: string;
}

const ResumeManagement: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [formData, setFormData] = useState({
    id: '',
    job_title: '',
    field: '',
    file: null as File | null,
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [resumeContent, setResumeContent] = useState<string | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get<Resume[]>('http://localhost:8000/resumes');
      setResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      setError('Error fetching resumes. Please try again later.');
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('job_title', formData.job_title);
    formDataToSend.append('field', formData.field);
    if (formData.file && !isEditing) {
      formDataToSend.append('file', formData.file);
    }

    try {
      if (isEditing && formData.id) {
        await axios.put(`http://localhost:8000/resumes/${formData.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('http://localhost:8000/resumes/upload', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      fetchResumes();
      setShowModal(false);
      setError(null);
    } catch (error) {
      console.error('Error uploading or updating resume:', error);
      setError('Error uploading or updating resume. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData({ ...formData, file });
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      await axios.delete(`http://localhost:8000/resumes/${resumeId}`);
      fetchResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      setError('Error deleting resume. Please try again.');
    }
  };

  const handleEditResume = (resume: Resume) => {
    setFormData({
      id: resume.id,
      job_title: resume.job_title,
      field: resume.field,
      file: null,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDownload = (filename: string) => {
    const downloadUrl = `http://localhost:8000/resumes/download/${filename}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewResume = (url: string) => {
    const fileExtension = url.split('.').pop()?.toLowerCase();
    if (fileExtension === 'pdf') {
      setFileType('application/pdf');
    } else if (['doc', 'docx'].includes(fileExtension || '')) {
      setFileType('application/msword');
    } else if (['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
      setFileType('image');
    } else if (fileExtension === 'txt') {
      setFileType('text/plain');
    } else {
      setFileType(null);
    }

    setResumeContent(url);
    setShowContentModal(true);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="container mt-4">
      <h2>Resume Management</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-start mb-4">
        <Button variant="secondary" onClick={handleBack} className="mr-2">
          Back to Companies
        </Button>

        <Button
          variant="primary"
          onClick={() => {
            setIsEditing(false);
            setFormData({ id: '', job_title: '', field: '', file: null });
            setShowModal(true);
          }}
        >
          Add Resume
        </Button>
      </div>

      <Form className="mb-3 mt-3">
        <Form.Control
          type="text"
          placeholder="Search resumes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form>

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>#</th>
            <th>Job Title</th>
            <th>Field</th>
            <th>Filename</th>
            <th>Download</th>
            <th>View Content</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {resumes
            .filter((resume) =>
              resume.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              resume.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
              resume.filename.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((resume, index) => (
              <tr key={resume.id}>
                <td>{index + 1}</td>
                <td>{resume.job_title}</td>
                <td>{resume.field}</td>
                <td>{resume.filename.split(/[/\\]/).pop()?.replace(/^[^_]+_/, '')}</td>
                <td>
                  <Button variant="link" onClick={() => handleDownload(resume.filename)}>
                    Download
                  </Button>
                </td>
                <td>
                  <Button variant="link" onClick={() => handleViewResume(resume.url)}>
                    View
                  </Button>
                </td>
                <td>
                  <Button variant="warning" onClick={() => handleEditResume(resume)} className="mr-2">
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteResume(resume.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Resume' : 'Add Resume'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpload}>
            <Form.Group>
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter job title"
                value={formData.job_title}
                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Field</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter field"
                value={formData.field}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                required
              />
            </Form.Group>
            {!isEditing && (
              <Form.Group>
                <Form.Label>Resume File</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} required />
              </Form.Group>
            )}
            <Button variant="primary" type="submit">
              {isEditing ? 'Update' : 'Upload'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showContentModal} onHide={() => setShowContentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Resume Content</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resumeContent ? (
            fileType === 'application/pdf' ? (
              <iframe src={resumeContent} style={{ width: '100%', height: '80vh' }} title="PDF Viewer"></iframe>
            ) : fileType === 'application/msword' ? (
              <iframe src={`https://view.officeapps.live.com/op/view.aspx?src=${resumeContent}`} style={{ width: '100%', height: '80vh' }} title="Word Viewer"></iframe>
            ) : fileType === 'text/plain' ? (
              <iframe src={resumeContent} style={{ width: '100%', height: '80vh' }} title="Text Viewer"></iframe>
            ) : (
              <p>Unsupported file type</p>
            )
          ) : (
            <p>No content available</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ResumeManagement;
