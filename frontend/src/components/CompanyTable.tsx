import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Table, Navbar, Nav, InputGroup, FormControl } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from 'react-router-dom';
import '../css/App.css';

interface Company {
    id: string;
    company_name: string;
    location: string;
    industry: string;
    website: string;
}

const App: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<Company>>({
        company_name: '',
        location: '',
        industry: '',
        website: ''
    });
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Company; direction: 'ascending' | 'descending' }>({
        key: 'company_name',
        direction: 'ascending',
    });


    useEffect(() => {
        async function fetchCompanies() {
            try {
                const response = await axios.get<Company[]>('http://localhost:8000/companies');
                const uniqueCompanies = Array.from(new Map(response.data.map(company => [company.id, company])).values());
                setCompanies(uniqueCompanies);
                setFilteredCompanies(uniqueCompanies);
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        }

        fetchCompanies();
    }, []);


    useEffect(() => {
        const filtered = companies.filter(company =>
            company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.website.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            return a[sortConfig.key].localeCompare(b[sortConfig.key], 'en', { numeric: true }) * (sortConfig.direction === 'ascending' ? 1 : -1);
        });

        setFilteredCompanies(filtered);
    }, [searchTerm, companies, sortConfig]);


    const handleShowModal = (companyId?: string) => {
        if (companyId) {
            const company = companies.find(c => c.id === companyId);
            if (company) {
                setSelectedCompanyId(companyId);
                setFormData(company);
                setEditMode(true);
            }
        } else {
            resetForm();
        }
        setShowModal(true);
    };


    const handleCloseModal = () => {
        resetForm();
        setShowModal(false);
    };

    // Handle adding or editing a company
    const handleAddOrEditCompany = async () => {
        try {
            const { company_name, location, industry, website } = formData;
            const newCompanyData = { company_name, location, industry, website };

            if (editMode && selectedCompanyId) {
                await axios.put(`http://localhost:8000/companies/${selectedCompanyId}`, newCompanyData);
            } else {
                await axios.post('http://localhost:8000/companies', newCompanyData);
            }

            const response = await axios.get<Company[]>('http://localhost:8000/companies');
            const uniqueCompanies = Array.from(new Map(response.data.map(company => [company.id, company])).values());
            setCompanies(uniqueCompanies);
            handleCloseModal();
        } catch (error) {
            console.error("Error saving company:", error);
        }
    };




    const handleDeleteCompany = async (companyId: string) => {
        try {
            await axios.delete(`http://localhost:8000/companies/${companyId}`);
            const response = await axios.get<Company[]>('http://localhost:8000/companies');
            const uniqueCompanies = Array.from(new Map(response.data.map(company => [company.id, company])).values());
            setCompanies(uniqueCompanies);
            setFilteredCompanies(uniqueCompanies);
        } catch (error) {
            console.error("Error deleting company:", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const requestSort = (key: keyof Company) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };


    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    const resetForm = () => {
        setFormData({
            company_name: '',
            location: '',
            industry: '',
            website: ''
        });
        setEditMode(false);
        setSelectedCompanyId(null);
    };

    return (
        <div className="App">
            <Navbar bg="dark" variant="dark" className="mb-4">
                <Navbar.Brand href="#home">Company Management Platform</Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link href="/resumes">Resume Management</Nav.Link>
                    <Nav.Link href="#" onClick={() => handleShowModal()}>Add New Company</Nav.Link>
                </Nav>
            </Navbar>

            <div className="search-container mb-3" style={{ border: '1px solid red', padding: '10px' }}>
                <InputGroup>
                    <FormControl
                        placeholder="Search..."
                        aria-label="Search"
                        aria-describedby="basic-addon2"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <InputGroup.Text>
                        <Button variant="outline-secondary">Search</Button>
                    </InputGroup.Text>
                </InputGroup>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <div className="table-title">Companies List</div>
                    <Button className="add-company-btn" onClick={() => handleShowModal()}>Add New Company</Button>
                </div>

                <Table striped bordered hover className="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th onClick={() => requestSort('company_name')} style={{ cursor: 'pointer' }}>
                                Company Name
                                {sortConfig.key === 'company_name' ? (
                                    sortConfig.direction === 'ascending' ? (
                                        <i className="fas fa-sort-up"></i>
                                    ) : (
                                        <i className="fas fa-sort-down"></i>
                                    )
                                ) : (
                                    <i className="fas fa-sort"></i>
                                )}
                            </th>
                            <th onClick={() => requestSort('location')} style={{ cursor: 'pointer' }}>
                                Location
                                {sortConfig.key === 'location' ? (
                                    sortConfig.direction === 'ascending' ? (
                                        <i className="fas fa-sort-up"></i>
                                    ) : (
                                        <i className="fas fa-sort-down"></i>
                                    )
                                ) : (
                                    <i className="fas fa-sort"></i>
                                )}
                            </th>
                            <th onClick={() => requestSort('industry')} style={{ cursor: 'pointer' }}>
                                Industry
                                {sortConfig.key === 'industry' ? (
                                    sortConfig.direction === 'ascending' ? (
                                        <i className="fas fa-sort-up"></i>
                                    ) : (
                                        <i className="fas fa-sort-down"></i>
                                    )
                                ) : (
                                    <i className="fas fa-sort"></i>
                                )}
                            </th>
                            <th onClick={() => requestSort('website')} style={{ cursor: 'pointer' }}>
                                Website
                                {sortConfig.key === 'website' ? (
                                    sortConfig.direction === 'ascending' ? (
                                        <i className="fas fa-sort-up"></i>
                                    ) : (
                                        <i className="fas fa-sort-down"></i>
                                    )
                                ) : (
                                    <i className="fas fa-sort"></i>
                                )}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCompanies.map((company, index) => (
                            <tr key={company.id}>
                                <td>{index + 1}</td>
                                <td>
                                    <Link to={`/company-details/${encodeURIComponent(company.company_name)}`} className="company-link">
                                        {company.company_name}
                                    </Link>
                                </td>
                                <td>{company.location}</td>
                                <td>{company.industry}</td>
                                <td>
                                    <a href={company.website.startsWith('http') ? company.website : `http://${company.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer">
                                        {company.website}
                                    </a>
                                </td>

                                <td>
                                    <Button variant="warning" onClick={() => handleShowModal(company.id)}>Edit</Button>
                                    <Button variant="danger" onClick={() => handleDeleteCompany(company.id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? 'Edit Company' : 'Add Company'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formCompanyName">
                            <Form.Label>Company Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter company name"
                                name="company_name"
                                value={formData.company_name || ''}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formLocation">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter location"
                                name="location"
                                value={formData.location || ''}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formIndustry">
                            <Form.Label>Industry</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter industry"
                                name="industry"
                                value={formData.industry || ''}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formWebsite">
                            <Form.Label>Website</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter website"
                                name="website"
                                value={formData.website || ''}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddOrEditCompany}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="scroll-to-top">
                <Button variant="primary" onClick={scrollToTop}>Scroll to Top</Button>
            </div>
        </div>
    );
}

export default App;
