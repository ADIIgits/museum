import { useState, useEffect } from 'react';
import { bookingsAPI, museumsAPI } from '../api';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'my-museums' | 'add-museum'
  const [bookings, setBookings] = useState([]);
  const [myMuseums, setMyMuseums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedMuseumFilter, setSelectedMuseumFilter] = useState('');

  // Form for adding a new museum
  const [newMuseum, setNewMuseum] = useState({
    name: '',
    description: '',
    location: '',
    image: '',
    ticket_price: '',
    opening_time: '09:00',
    closing_time: '18:00',
  });
  const [submittingMuseum, setSubmittingMuseum] = useState(false);

  const fetchBookings = async (searchVal = search, dateVal = dateFilter, museumId = selectedMuseumFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (searchVal.trim()) params.search = searchVal.trim();
      if (dateVal) params.date = dateVal;
      if (museumId) params.museum = museumId;

      const { data } = await bookingsAPI.adminList(params);
      setBookings(data);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to fetch bookings';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyMuseums = async () => {
    try {
      const { data } = await museumsAPI.myMuseums();
      setMyMuseums(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchMyMuseums();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings(search, dateFilter, selectedMuseumFilter);
  };

  const handleClear = () => {
    setSearch('');
    setDateFilter('');
    setSelectedMuseumFilter('');
    fetchBookings('', '', '');
  };

  const handleMuseumFormChange = (e) => {
    setNewMuseum((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateMuseum = async (e) => {
    e.preventDefault();
    if (!newMuseum.name || !newMuseum.description || !newMuseum.ticket_price) {
      toast.error('Please fill in required museum fields.');
      return;
    }
    setSubmittingMuseum(true);
    try {
      const payload = {
        ...newMuseum,
        ticket_price: parseFloat(newMuseum.ticket_price),
      };
      const { data } = await museumsAPI.create(payload);
      toast.success(`"${data.name}" listed successfully! 🏛️`);
      setNewMuseum({
        name: '',
        description: '',
        location: '',
        image: '',
        ticket_price: '',
        opening_time: '09:00',
        closing_time: '18:00',
      });
      fetchMyMuseums();
      setActiveTab('my-museums');
    } catch (err) {
      const errors = err.response?.data;
      if (errors && typeof errors === 'object') {
        const firstKey = Object.keys(errors)[0];
        toast.error(`${firstKey}: ${errors[firstKey]}`);
      } else {
        toast.error('Failed to list museum.');
      }
    } finally {
      setSubmittingMuseum(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      confirmed: { cls: 'badge-success', label: 'Confirmed' },
      pending: { cls: 'badge-warning', label: 'Pending Payment' },
      cancelled: { cls: 'badge-danger', label: 'Cancelled' },
    };
    const s = map[status] || map.pending;
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

  const totalVisitorsCount = bookings.reduce(
    (sum, b) => sum + (b.num_tickets || 1),
    0
  );

  return (
    <div className="tickets-page">
      <div className="container">
        {/* Header */}
        <div className="tickets-page-header fade-in-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>🏛️</span>
              <div>
                <h1 className="tickets-page-title">Museum Operator Dashboard</h1>
                <p className="tickets-page-subtitle">
                  Manage your museum listings and track real-time bookings
                </p>
              </div>
            </div>

            {/* Tab navigation pills */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`nav-pill ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                🎫 Bookings ({bookings.length})
              </button>
              <button
                className={`nav-pill ${activeTab === 'my-museums' ? 'active' : ''}`}
                onClick={() => setActiveTab('my-museums')}
              >
                🏛️ My Museums ({myMuseums.length})
              </button>
              <button
                className={`nav-pill ${activeTab === 'add-museum' ? 'active' : ''}`}
                onClick={() => setActiveTab('add-museum')}
              >
                ➕ Add Museum
              </button>
            </div>
          </div>
        </div>

        {/* METRICS ROW (Applying Apple rounded palette cards) */}
        <div
          className="fade-in-up stagger-1"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          <div className="card stat-card-teal" style={{ padding: 'var(--space-5)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              My Museums Listed
            </div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginTop: '6px' }}>
              {myMuseums.length}
            </div>
          </div>

          <div className="card stat-card-sage" style={{ padding: 'var(--space-5)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Bookings Received
            </div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginTop: '6px' }}>
              {bookings.length}
            </div>
          </div>

          <div className="card stat-card-lime" style={{ padding: 'var(--space-5)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Visitors
            </div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginTop: '6px' }}>
              {totalVisitorsCount}
            </div>
          </div>

          <div className="card stat-card-amber" style={{ padding: 'var(--space-5)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Revenue
            </div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginTop: '6px' }}>
              ₹{totalRevenue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* TAB 1: BOOKINGS LIST & SEARCH */}
        {activeTab === 'bookings' && (
          <div>
            {/* Search Toolbar */}
            <div className="card fade-in-up stagger-2" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <form
                onSubmit={handleSearchSubmit}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: '2', minWidth: '220px' }}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Search visitor, booker name, email, ticket ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div style={{ flex: '1', minWidth: '150px' }}>
                  <input
                    className="form-input"
                    type="date"
                    title="Filter by Visit Date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>

                {myMuseums.length > 1 && (
                  <div style={{ flex: '1', minWidth: '160px' }}>
                    <select
                      className="form-input"
                      value={selectedMuseumFilter}
                      onChange={(e) => setSelectedMuseumFilter(e.target.value)}
                    >
                      <option value="">All My Museums</option>
                      {myMuseums.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-md">
                  🔍 Search
                </button>

                {(search || dateFilter || selectedMuseumFilter) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="btn btn-ghost btn-md"
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>

            {loading ? (
              <div className="page-loader" style={{ minHeight: '200px' }}>
                <div className="spinner spinner-lg" style={{ color: 'var(--color-primary)' }} />
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state fade-in-up">
                <div className="empty-state-icon">🔎</div>
                <h2 className="empty-state-title">No bookings found for your museums</h2>
                <p className="empty-state-text">
                  {search || dateFilter
                    ? 'No bookings matched your search query.'
                    : 'When users book tickets for museums you manage, they will show up here.'}
                </p>
                {(search || dateFilter) && (
                  <button onClick={handleClear} className="btn btn-secondary btn-md">
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="tickets-list">
                {bookings.map((booking, i) => (
                  <div
                    key={booking.id}
                    className={`ticket-card fade-in-up stagger-${Math.min(i + 1, 3)}`}
                    style={{
                      alignItems: 'flex-start',
                      padding: 'var(--space-5)',
                    }}
                  >
                    <img
                      className="ticket-card-thumb"
                      src={booking.museum?.image || 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80'}
                      alt={booking.museum?.name}
                      style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '10px' }}
                    />

                    <div className="ticket-card-info" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0 }}>{booking.museum?.name}</h3>
                        {statusBadge(booking.status)}
                      </div>

                      <p style={{ marginTop: '6px', color: 'var(--color-text-secondary)' }}>
                        📅 <strong>Visit Date:</strong>{' '}
                        {new Date(booking.visit_date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {' • '}
                        🎟️ {booking.num_tickets} ticket{booking.num_tickets > 1 ? 's' : ''}
                      </p>

                      <div
                        style={{
                          marginTop: '8px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border)',
                          fontSize: 'var(--font-size-sm)',
                        }}
                      >
                        <div>
                          👤 <strong>Booked by:</strong> {booking.user?.name} (
                          <span style={{ color: 'var(--color-text-muted)' }}>{booking.user?.email}</span>
                          {booking.user?.phone ? ` • 📞 ${booking.user?.phone}` : ''})
                        </div>
                        {booking.visitor_names && booking.visitor_names.length > 0 && (
                          <div style={{ marginTop: '4px' }}>
                            👥 <strong>Visitors ({booking.visitor_names.length}):</strong>{' '}
                            {booking.visitor_names.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="ticket-card-right"
                      style={{
                        alignItems: 'flex-end',
                        minWidth: '160px',
                        textAlign: 'right',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 'var(--font-size-xl)',
                          fontWeight: 700,
                          color: 'var(--color-primary-hover)',
                        }}
                      >
                        ₹{booking.total_price}
                      </span>

                      <span className="ticket-id" title="Ticket ID" style={{ marginTop: '4px' }}>
                        #{booking.ticket_id?.slice(0, 8).toUpperCase()}
                      </span>

                      {booking.payment_id && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-text-muted)',
                            marginTop: '4px',
                          }}
                        >
                          Ref: {booking.payment_id}
                        </span>
                      )}

                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          marginTop: '6px',
                        }}
                      >
                        Booked {new Date(booking.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY MUSEUMS */}
        {activeTab === 'my-museums' && (
          <div className="fade-in-up">
            {myMuseums.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏛️</div>
                <h2 className="empty-state-title">You haven't listed any museums yet</h2>
                <p className="empty-state-text">
                  Add your museum details to start accepting visitor bookings!
                </p>
                <button onClick={() => setActiveTab('add-museum')} className="btn btn-primary btn-md">
                  ➕ List Your First Museum
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: 'var(--space-5)',
                }}
              >
                {myMuseums.map((museum) => (
                  <div key={museum.id} className="card" style={{ overflow: 'hidden' }}>
                    <img
                      src={museum.image || 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800&q=80'}
                      alt={museum.name}
                      style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: 'var(--space-4)' }}>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: 'var(--font-size-lg)' }}>{museum.name}</h3>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', margin: '0 0 10px 0' }}>
                        📍 {museum.location}
                      </p>
                      <p
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text-secondary)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {museum.description}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: 'var(--space-4)',
                          paddingTop: 'var(--space-3)',
                          borderTop: '1px solid var(--color-border)',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: 'var(--color-primary-hover)' }}>
                          ₹{museum.ticket_price} / ticket
                        </span>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          🕒 {museum.opening_time} - {museum.closing_time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADD NEW MUSEUM */}
        {activeTab === 'add-museum' && (
          <div className="card fade-in-up" style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--space-6)' }}>
            <h2 style={{ marginBottom: 'var(--space-2)' }}>List a New Museum</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-5)' }}>
              Enter your museum details. Once published, visitors will be able to book tickets immediately.
            </p>

            <form onSubmit={handleCreateMuseum} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Museum Name *</label>
                <input
                  className="form-input"
                  name="name"
                  type="text"
                  placeholder="e.g. Modern Art Gallery & Sculpture Garden"
                  value={newMuseum.name}
                  onChange={handleMuseumFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / Address *</label>
                <input
                  className="form-input"
                  name="location"
                  type="text"
                  placeholder="e.g. MG Road, Bengaluru, Karnataka 560001"
                  value={newMuseum.location}
                  onChange={handleMuseumFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-input"
                  name="description"
                  rows={4}
                  placeholder="Detailed description of exhibits, collections, and visitor guidelines..."
                  value={newMuseum.description}
                  onChange={handleMuseumFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cover Image URL</label>
                <input
                  className="form-input"
                  name="image"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newMuseum.image}
                  onChange={handleMuseumFormChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                <div className="form-group">
                  <label className="form-label">Ticket Price (₹) *</label>
                  <input
                    className="form-input"
                    name="ticket_price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="250.00"
                    value={newMuseum.ticket_price}
                    onChange={handleMuseumFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Opening Time</label>
                  <input
                    className="form-input"
                    name="opening_time"
                    type="time"
                    value={newMuseum.opening_time}
                    onChange={handleMuseumFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Closing Time</label>
                  <input
                    className="form-input"
                    name="closing_time"
                    type="time"
                    value={newMuseum.closing_time}
                    onChange={handleMuseumFormChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={submittingMuseum}
                style={{ marginTop: 'var(--space-3)' }}
              >
                {submittingMuseum ? <span className="spinner" /> : 'Publish Museum Listing 🏛️'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
