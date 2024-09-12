import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/CompanyDetails.css';

interface CompanyDetailsResponse {
  company_name: string;
  description: string;
  images: string[];
  address?: string;
  videoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  numEmployees?: number;
  revenue?: string;
  globalOffices?: number;
}

const CompanyDetails: React.FC = () => {
  const { companyName } = useParams<{ companyName: string }>();
  const [companyDetails, setCompanyDetails] = useState<CompanyDetailsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [jobListings, setJobListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await axios.get<CompanyDetailsResponse>(`http://localhost:8000/company-details/${companyName}`);
        setCompanyDetails(response.data);
      } catch (error) {
        setError("Failed to fetch company details.");
      } finally {
        setLoading(false);
      }
    };

    const fetchJobListings = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/job-listings/${companyName}`);
        setJobListings(response.data);
      } catch (error) {
        console.error("Failed to fetch job listings.");
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/reviews/${companyName}`);
        setReviews(response.data);
      } catch (error) {
        console.error("Failed to fetch reviews.");
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/events/${companyName}`);
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events.");
      }
    };

    fetchCompanyDetails();
    fetchJobListings();
    fetchReviews();
    fetchEvents();
  }, [companyName]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <p>{error}</p>;

  if (!companyDetails) {
    return <p>No details available for this company.</p>;
  }

  const images = Array.isArray(companyDetails.images) ? companyDetails.images : [];

  return (
    <Container className="mt-4">
      <Button variant="secondary" href="/">Back to Companies</Button>
      <div className="company-details">
        <Card className="company-card">
          <Card.Body>
            <Card.Title className="company-title">{companyDetails.company_name}</Card.Title>
            <Row>
              <Col md={8}>
                <Card.Text className="company-description">
                  {companyDetails.description}
                </Card.Text>
              </Col>
              <Col md={4}>
                {images.length > 0 && (
                  <div className="company-images">
                    {images.map((imgUrl, index) => (
                      <img key={index} src={imgUrl} alt={`Company ${companyDetails.company_name} ${index}`} className="company-image" />
                    ))}
                  </div>
                )}
              </Col>
            </Row>
            {companyDetails.address && (
              <Row>
                <Col md={12}>
                  <div className="company-location">
                    <h5>Location:</h5>
                  </div>
                </Col>
              </Row>
            )}
            {companyDetails.videoUrl && (
              <Row>
                <Col md={12}>
                  <div className="company-video">
                    <h5>Company Video:</h5>
                  </div>
                </Col>
              </Row>
            )}
            {companyDetails.contactEmail || companyDetails.contactPhone ? (
              <Row>
                <Col md={12}>
                  <div className="company-contact">
                    <h5>Contact Information:</h5>
                    {companyDetails.contactEmail && <p>Email: {companyDetails.contactEmail}</p>}
                    {companyDetails.contactPhone && <p>Phone: {companyDetails.contactPhone}</p>}
                    {companyDetails.address && <p>Address: {companyDetails.address}</p>}
                  </div>
                </Col>
              </Row>
            ) : null}
            {companyDetails.numEmployees || companyDetails.revenue || companyDetails.globalOffices ? (
              <Row>
                <Col md={12}>
                  <div className="company-stats">
                    <h5>Company Statistics:</h5>
                    {companyDetails.numEmployees && <p>Number of Employees: {companyDetails.numEmployees}</p>}
                    {companyDetails.revenue && <p>Revenue: {companyDetails.revenue}</p>}
                    {companyDetails.globalOffices && <p>Global Offices: {companyDetails.globalOffices}</p>}
                  </div>
                </Col>
              </Row>
            ) : null}
            <Row>
              <Col md={12}>
                <div className="company-jobs">
                  <h5>Open Positions:</h5>
                  {jobListings.length > 0 ? (
                    <ul>
                      {jobListings.map((job, index) => (
                        <li key={index}>{job.title} - <a href={job.applyLink} target="_blank" rel="noopener noreferrer">Apply Here</a></li>
                      ))}
                    </ul>
                  ) : (
                    <p>No job listings available.</p>
                  )}
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <div className="company-reviews">
                  <h5>Reviews:</h5>
                  {reviews.length > 0 ? (
                    <ul>
                      {reviews.map((review, index) => (
                        <li key={index}>
                          <p>{review.comment}</p>
                          <small>- {review.reviewer}</small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No reviews available.</p>
                  )}
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <div className="company-events">
                  <h5>Upcoming Events:</h5>
                  {events.length > 0 ? (
                    <ul>
                      {events.map((event, index) => (
                        <li key={index}>{event.name} - {event.date}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No upcoming events.</p>
                  )}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default CompanyDetails;
