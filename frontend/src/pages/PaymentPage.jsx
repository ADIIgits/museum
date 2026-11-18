import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookingsAPI } from '../api';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    bookingsAPI
      .detail(id)
      .then(({ data }) => {
        setBooking(data);
        if (data.status === 'confirmed') {
          setPaid(true);
        }
      })
      .catch(() => {
        toast.error('Booking not found');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const { data } = await bookingsAPI.pay(id);
      setBooking(data);
      setPaid(true);
      toast.success('Payment successful! Your ticket is ready 🎫');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Payment failed';
      toast.error(msg);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-lg" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!booking) return null;

  // Success state
  if (paid) {
    return (
      <div className="payment-page">
        <div className="payment-card fade-in-up">
          <div className="payment-icon payment-success-icon">✓</div>
          <h1 className="payment-title">Payment Confirmed!</h1>
          <p className="payment-subtitle">
            Your ticket has been generated successfully
          </p>

          <div className="payment-details">
            <div className="payment-detail-row">
              <span className="payment-detail-label">Ticket ID</span>
              <span className="payment-detail-value ticket-id">
                {booking.ticket_id?.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="payment-detail-row">
              <span className="payment-detail-label">Museum</span>
              <span className="payment-detail-value">{booking.museum?.name}</span>
            </div>
            <div className="payment-detail-row">
              <span className="payment-detail-label">Visit Date</span>
              <span className="payment-detail-value">
                {new Date(booking.visit_date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="payment-detail-row">
              <span className="payment-detail-label">Tickets</span>
              <span className="payment-detail-value">{booking.num_tickets}</span>
            </div>
            {booking.visitor_names && booking.visitor_names.length > 0 && (
              <div className="payment-detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="payment-detail-label" style={{ marginBottom: '4px' }}>Visitors</span>
                <span className="payment-detail-value" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  {booking.visitor_names.join(', ')}
                </span>
              </div>
            )}
            <div className="payment-detail-row">
              <span className="payment-detail-label">Total Paid</span>
              <span className="payment-detail-value" style={{ color: 'var(--color-success)' }}>
                ₹{booking.total_price}
              </span>
            </div>
            <div className="payment-detail-row">
              <span className="payment-detail-label">Payment Ref</span>
              <span className="payment-detail-value ticket-id">
                {booking.payment_id}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <Link to="/tickets" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
              View My Tickets
            </Link>
            <Link to="/" className="btn btn-secondary btn-lg" style={{ flex: 1 }}>
              Browse More
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Payment pending state
  return (
    <div className="payment-page">
      <div className="payment-card fade-in-up">
        <div className="payment-icon">💳</div>
        <h1 className="payment-title">Complete Payment</h1>
        <p className="payment-subtitle">
          Review your booking and confirm payment
        </p>

        <div className="payment-details">
          <div className="payment-detail-row">
            <span className="payment-detail-label">Museum</span>
            <span className="payment-detail-value">{booking.museum?.name}</span>
          </div>
          <div className="payment-detail-row">
            <span className="payment-detail-label">Visit Date</span>
            <span className="payment-detail-value">
              {new Date(booking.visit_date).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="payment-detail-row">
            <span className="payment-detail-label">Tickets</span>
            <span className="payment-detail-value">{booking.num_tickets}</span>
          </div>
          {booking.visitor_names && booking.visitor_names.length > 0 && (
            <div className="payment-detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="payment-detail-label" style={{ marginBottom: '4px' }}>Visitors</span>
              <span className="payment-detail-value" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                {booking.visitor_names.join(', ')}
              </span>
            </div>
          )}
          <div className="payment-detail-row">
            <span className="payment-detail-label">Total</span>
            <span className="payment-detail-value" style={{ color: 'var(--color-primary-hover)', fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
              ₹{booking.total_price}
            </span>
          </div>
        </div>

        <button
          onClick={handlePay}
          className="btn btn-primary btn-full btn-lg"
          disabled={paying}
        >
          {paying ? (
            <span className="spinner" />
          ) : (
            `Pay ₹${booking.total_price}`
          )}
        </button>

        <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          🔒 This is a simulated payment. No real charges apply.
        </p>
      </div>
    </div>
  );
}
