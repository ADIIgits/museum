import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { museumsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const [museums, setMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    museumsAPI
      .list()
      .then(({ data }) => setMuseums(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title fade-in-up">
            Discover. Explore.
            <br />
            Experience Culture.
          </h1>
          <p className="hero-subtitle fade-in-up stagger-1">
            Book tickets to India's finest museums in seconds. Skip the lines,
            dive straight into history, art, and science.
          </p>
          {!user && (
            <Link to="/register" className="btn btn-primary btn-lg fade-in-up stagger-2">
              Start Exploring →
            </Link>
          )}
        </div>
      </section>

      {/* Museums Grid */}
      <section className="museums-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Museums</h2>
            <span className="badge badge-primary">{museums.length} available</span>
          </div>

          {loading ? (
            <div className="page-loader">
              <div className="spinner spinner-lg" style={{ color: 'var(--color-primary)' }} />
            </div>
          ) : (
            <div className="museums-grid">
              {museums.map((museum, i) => (
                <Link
                  to={`/museums/${museum.id}`}
                  key={museum.id}
                  className={`card fade-in-up stagger-${i + 1}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <img
                    className="card-image"
                    src={museum.image}
                    alt={museum.name}
                    loading="lazy"
                  />
                  <div className="card-body">
                    <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                      {museum.name}
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {museum.description}
                    </p>
                    <div className="museum-card-meta">
                      <span>📍</span>
                      <span>{museum.location.split(',')[0]}</span>
                      <span style={{ margin: '0 var(--space-2)' }}>•</span>
                      <span>🕐 {formatTime(museum.opening_time)} – {formatTime(museum.closing_time)}</span>
                    </div>
                    <div className="museum-card-footer">
                      <div className="museum-card-price">
                        ₹{museum.ticket_price} <span>/ person</span>
                      </div>
                      <span className="btn btn-primary btn-sm">Book Now</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
