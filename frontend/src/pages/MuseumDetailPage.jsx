import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { museumsAPI, bookingsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MuseumDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [museum, setMuseum] = useState(null);
  const [loading, setLoading] = useState(true);

  const [numTickets, setNumTickets] = useState(1);
  const [visitorNames, setVisitorNames] = useState(user ? [user.name] : ['']);
  const [visitDate, setVisitDate] = useState('');
  const [booking, setBooking] = useState(false);

  const handleNumTicketsChange = (e) => {
    let val = parseInt(e.target.value) || 1;
    if (val < 1) val = 1;
    if (val > 4) {
      val = 4;
      toast.error('You can only book tickets for yourself + up to 3 guests (max 4 tickets total)');
    }
    setNumTickets(val);
    setVisitorNames(prev => {
      const newNames = [...prev];
      while (newNames.length < val) newNames.push('');
      return newNames.slice(0, val);
    });
  };

  useEffect(() => {
    museumsAPI
      .detail(id)
      .then(({ data }) => setMuseum(data))
      .catch(() => {
        toast.error('Museum not found');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour % 12 || 12}:${m} ${ampm}`;
  };

  const totalPrice = museum
    ? (parseFloat(museum.ticket_price) * numTickets).toFixed(2)
    : '0.00';

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to book tickets');
      navigate('/login');
      return;
    }
    if (!visitDate) {
      toast.error('Please select a visit date');
      return;
    }
    if (visitorNames.some(name => !name.trim())) {
      toast.error('Please enter names for all visitors');
      return;
    }
    setBooking(true);
    try {
      const { data } = await bookingsAPI.create({
        museum: museum.id,
        num_tickets: numTickets,
        visit_date: visitDate,
        visitor_names: visitorNames,
      });
      navigate(`/payment/${data.id}`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Booking failed. Try again.';
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-lg" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!museum) return null;

  return (
    <div className="museum-detail">
      <div className="container">
        {/* Header Image */}
        <div className="museum-detail-header fade-in-up">
          <img
            className="museum-detail-image"
            src={museum.image}
            alt={museum.name}
          />
          <div className="museum-detail-overlay">
            <h1 className="museum-detail-name">{museum.name}</h1>
            <p className="museum-detail-location">📍 {museum.location}</p>
          </div>
        </div>

        {/* Body */}
        <div className="museum-detail-body">
          {/* Info */}
          <div className="museum-detail-info fade-in-up stagger-1">
            <h2>About</h2>
            <p>{museum.description}</p>

            <div className="museum-info-grid">
              <div className="museum-info-item">
                <div className="museum-info-item-label">Opening Time</div>
                <div className="museum-info-item-value">
                  {formatTime(museum.opening_time)}
                </div>
              </div>
              <div className="museum-info-item">
                <div className="museum-info-item-label">Closing Time</div>
                <div className="museum-info-item-value">
                  {formatTime(museum.closing_time)}
                </div>
              </div>
              <div className="museum-info-item">
                <div className="museum-info-item-label">Ticket Price</div>
                <div className="museum-info-item-value">
                  ₹{museum.ticket_price}
                </div>
              </div>
              <div className="museum-info-item">
                <div className="museum-info-item-label">Status</div>
                <div className="museum-info-item-value">
                  <span className="badge badge-success">Open</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="booking-sidebar fade-in-up stagger-2">
            <div className="booking-card">
              <h3 className="booking-card-title">Book Your Visit</h3>
              <form className="booking-form" onSubmit={handleBook}>
                <div className="form-group">
                  <label className="form-label" htmlFor="visit-date">
                    Visit Date
                  </label>
                  <input
                    id="visit-date"
                    className="form-input"
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    min={minDate}
                    required
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" htmlFor="num-tickets">
                      Number of Tickets
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      Max 4 (You + 3 guests)
                    </span>
                  </div>
                  <input
                    id="num-tickets"
                    className="form-input"
                    type="number"
                    value={numTickets}
                    onChange={handleNumTicketsChange}
                    min={1}
                    max={4}
                  />
                </div>

                {visitorNames.map((name, i) => (
                  <div className="form-group" key={i}>
                    <label className="form-label">Visitor {i + 1} Name</label>
                    <input
                      className="form-input"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const newNames = [...visitorNames];
                        newNames[i] = e.target.value;
                        setVisitorNames(newNames);
                      }}
                      required
                    />
                  </div>
                ))}

                <div className="booking-total">
                  <span className="booking-total-label">Total</span>
                  <span className="booking-total-value">₹{totalPrice}</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={booking}
                >
                  {booking ? (
                    <span className="spinner" />
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
