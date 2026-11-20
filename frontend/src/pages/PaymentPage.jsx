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

  // Card details form
  const [card, setCard] = useState({
    cardNumber: '4242 •••• •••• 4242',
    rawNumber: '4242424242424242',
    nameOnCard: '',
    expiry: '12/28',
    cvv: '123',
  });

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

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCard((prev) => ({
      ...prev,
      rawNumber: raw,
      cardNumber: formatted,
    }));
  };

  const handleQuickFill = (type) => {
    if (type === 'approve_visa') {
      setCard({
        rawNumber: '4242424242424242',
        cardNumber: '4242 4242 4242 4242',
        nameOnCard: 'Alex Morgan',
        expiry: '12/28',
        cvv: '888',
      });
      toast.success('Filled with Payate Test Visa (Approves)');
    } else if (type === 'approve_mastercard') {
      setCard({
        rawNumber: '5555555555554444',
        cardNumber: '5555 5555 5555 4444',
        nameOnCard: 'Taylor Smith',
        expiry: '09/29',
        cvv: '321',
      });
      toast.success('Filled with Test Mastercard (Approves)');
    } else if (type === 'decline') {
      setCard({
        rawNumber: '4000000000000002',
        cardNumber: '4000 0000 0000 0002',
        nameOnCard: 'Jordan Doe',
        expiry: '05/27',
        cvv: '000',
      });
      toast('Filled with Payate Decline Test Card', { icon: '⚠️' });
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setPaying(true);
    try {
      const payload = {
        card_number: card.rawNumber || '4242424242424242',
        expiry: card.expiry,
        cvv: card.cvv,
        name_on_card: card.nameOnCard || 'Visitor',
      };
      const { data } = await bookingsAPI.pay(id, payload);
      setBooking(data);
      setPaid(true);
      toast.success('Payment authorized via Payate Sandbox! 🎫');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Payment was declined by the gateway.';
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

  // Confirmed success state
  if (paid) {
    return (
      <div className="payment-page">
        <div className="payment-card fade-in-up">
          <div className="payment-icon payment-success-icon">✓</div>
          <h1 className="payment-title">Payment Confirmed!</h1>
          <p className="payment-subtitle">
            Processed via <strong>Payate Mock Gateway</strong>
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
              <span className="payment-detail-value" style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                ₹{booking.total_price}
              </span>
            </div>
            <div className="payment-detail-row">
              <span className="payment-detail-label">Transaction Ref</span>
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

  // Payment pending checkout form state
  return (
    <div className="payment-page">
      <div className="payment-card fade-in-up" style={{ maxWidth: '540px' }}>
        <div className="payment-icon">💳</div>
        <h1 className="payment-title">Checkout</h1>
        <p className="payment-subtitle">
          Payate & Visatk Mock Payment Sandbox
        </p>

        {/* Order Summary Pill */}
        <div className="payment-details" style={{ marginBottom: 'var(--space-5)' }}>
          <div className="payment-detail-row">
            <span className="payment-detail-label">Museum</span>
            <span className="payment-detail-value">{booking.museum?.name}</span>
          </div>
          <div className="payment-detail-row">
            <span className="payment-detail-label">Visit Date</span>
            <span className="payment-detail-value">
              {new Date(booking.visit_date).toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="payment-detail-row">
            <span className="payment-detail-label">Tickets</span>
            <span className="payment-detail-value">{booking.num_tickets} ticket(s)</span>
          </div>
          {booking.visitor_names && booking.visitor_names.length > 0 && (
            <div className="payment-detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <span className="payment-detail-label" style={{ marginBottom: '4px' }}>Visitors</span>
              <span className="payment-detail-value" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                {booking.visitor_names.join(', ')}
              </span>
            </div>
          )}
          <div className="payment-detail-row" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '8px', marginTop: '4px' }}>
            <span className="payment-detail-label" style={{ fontWeight: 600 }}>Amount Due</span>
            <span className="payment-detail-value" style={{ color: 'var(--pal-teal-light)', fontWeight: 800, fontSize: 'var(--font-size-xl)' }}>
              ₹{booking.total_price}
            </span>
          </div>
        </div>

        {/* Sandbox Test Quick-Fill Pills */}
        <div style={{ marginBottom: 'var(--space-5)', textAlign: 'left' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
            ⚡ Instant Sandbox Test Cards
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="nav-pill nav-pill-teal"
              style={{ fontSize: '11px', padding: '6px 12px' }}
              onClick={() => handleQuickFill('approve_visa')}
            >
              ✓ Visa (Approve)
            </button>
            <button
              type="button"
              className="nav-pill nav-pill-sage"
              style={{ fontSize: '11px', padding: '6px 12px' }}
              onClick={() => handleQuickFill('approve_mastercard')}
            >
              ✓ Mastercard (Approve)
            </button>
            <button
              type="button"
              className="nav-pill nav-pill-amber"
              style={{ fontSize: '11px', padding: '6px 12px' }}
              onClick={() => handleQuickFill('decline')}
            >
              ✕ Decline Test
            </button>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label">Card Number</label>
            <input
              className="form-input"
              type="text"
              placeholder="4242 4242 4242 4242"
              value={card.cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Name on Card</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Alex Morgan"
              value={card.nameOnCard}
              onChange={(e) => setCard((prev) => ({ ...prev, nameOnCard: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label">Expiry (MM/YY)</label>
              <input
                className="form-input"
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                value={card.expiry}
                onChange={(e) => setCard((prev) => ({ ...prev, expiry: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">CVV</label>
              <input
                className="form-input"
                type="password"
                placeholder="123"
                maxLength={4}
                value={card.cvv}
                onChange={(e) => setCard((prev) => ({ ...prev, cvv: e.target.value }))}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={paying}
            style={{ marginTop: 'var(--space-3)' }}
          >
            {paying ? <span className="spinner" /> : `Pay ₹${booking.total_price}`}
          </button>
        </form>

        <p style={{ marginTop: 'var(--space-4)', fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          🔒 Payate / Visatk Sandbox mode active. Standard test cards simulated without live bank charges.
        </p>
      </div>
    </div>
  );
}
