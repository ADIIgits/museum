import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../api';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI
      .list()
      .then(({ data }) => setTickets(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map = {
      confirmed: { cls: 'badge-success', label: 'Confirmed' },
      pending: { cls: 'badge-warning', label: 'Pending Payment' },
      cancelled: { cls: 'badge-danger', label: 'Cancelled' },
    };
    const s = map[status] || map.pending;
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-lg" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="tickets-page">
      <div className="container">
        <div className="tickets-page-header fade-in-up">
          <h1 className="tickets-page-title">My Tickets</h1>
          <p className="tickets-page-subtitle">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} in your account
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="empty-state fade-in-up">
            <div className="empty-state-icon">🎫</div>
            <h2 className="empty-state-title">No tickets yet</h2>
            <p className="empty-state-text">
              Browse our museums and book your first visit!
            </p>
            <Link to="/" className="btn btn-primary btn-lg">
              Explore Museums
            </Link>
          </div>
        ) : (
          <div className="tickets-list">
            {tickets.map((ticket, i) => (
              <div
                key={ticket.id}
                className={`ticket-card fade-in-up stagger-${Math.min(i + 1, 3)}`}
              >
                <img
                  className="ticket-card-thumb"
                  src={ticket.museum?.image}
                  alt={ticket.museum?.name}
                />
                <div className="ticket-card-info">
                  <h3>{ticket.museum?.name}</h3>
                  <p>
                    📅{' '}
                    {new Date(ticket.visit_date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {' • '}
                    {ticket.num_tickets} ticket{ticket.num_tickets > 1 ? 's' : ''}
                  </p>
                  {ticket.visitor_names && ticket.visitor_names.length > 0 && (
                    <p style={{ marginTop: 'var(--space-2)' }}>
                      👥 {ticket.visitor_names.join(', ')}
                    </p>
                  )}
                </div>
                <div className="ticket-card-right">
                  {statusBadge(ticket.status)}
                  <span className="ticket-id">
                    {ticket.ticket_id?.slice(0, 8).toUpperCase()}
                  </span>
                  <span
                    style={{
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 700,
                      color: 'var(--color-primary-hover)',
                    }}
                  >
                    ₹{ticket.total_price}
                  </span>
                  {ticket.status === 'pending' && (
                    <Link
                      to={`/payment/${ticket.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Complete Payment
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
