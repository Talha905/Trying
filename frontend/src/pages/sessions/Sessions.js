import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import '../../styles/pages/Sessions.css';

function Sessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'upcoming') params.set('upcoming', 'true');
      if (filter === 'past') params.set('past', 'true');
      if (filter !== 'all') params.set('status', filter);

      const response = await api.get(`/sessions?${params.toString()}`);
      setSessions(response.data.data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'badge badge-success';
      case 'InProgress': return 'badge badge-primary';
      case 'Cancelled': return 'badge badge-error';
      case 'Scheduled': return 'badge badge-warning';
      default: return 'badge badge-secondary';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading sessions..." />;
  }

  return (
    <div className="sessions-container fade-in">
      <div className="sessions-header decorative-dots">
        <div className="header-content">
          <h1>My Sessions</h1>
          <p className="header-subtitle text-compact">{sessions.length} total session{sessions.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="sessions-filters flex-dense-sm">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`filter-btn ${filter === 'Scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('Scheduled')}
          >
            Scheduled
          </button>
          <button 
            className={`filter-btn ${filter === 'Completed' ? 'active' : ''}`}
            onClick={() => setFilter('Completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {sessions.length > 0 ? (
        <div className="sessions-layout">
          <div className="sessions-main">
            <div className="sessions-grid grid-dense-sm">
              {sessions.map(session => (
                <div key={session._id} className="session-card decorative-line">
                  <div className="session-card-header">
                    <h3 className="text-dense">{session.title}</h3>
                    <span className={getStatusBadgeClass(session.status)}>
                      {session.status}
                    </span>
                  </div>
                  
                  <div className="session-card-body p-compact">
                    <div className="session-meta grid-dense-xs">
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span className="meta-text text-compact">{formatDate(session.scheduledAt)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">⏱️</span>
                        <span className="meta-text text-compact">{session.duration} min</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">{user?.role === 'Mentor' ? '👤' : '🎓'}</span>
                        <span className="meta-text text-compact">{user?.role === 'Mentor' ? session.mentee?.name : session.mentor?.name}</span>
                      </div>
                    </div>
                    {session.description && (
                      <p className="session-description text-compact mt-compact">{session.description}</p>
                    )}
                  </div>

                  <div className="session-card-actions flex-dense-sm px-compact pb-compact">
                    <Link to={`/sessions/${session._id}`} className="btn btn-primary btn-sm">
                      Details
                    </Link>
                    {session.status === 'Scheduled' && (
                      <span className="chip">Ready to join</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="sessions-sidebar">
            <div className="sidebar-section">
              <h4>Quick Stats</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{sessions.filter(s => s.status === 'Scheduled').length}</div>
                  <div className="stat-label">Upcoming</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{sessions.filter(s => s.status === 'Completed').length}</div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>
            </div>
            
            {user?.role === 'Mentee' && (
              <div className="sidebar-section">
                <h4>Session Tips</h4>
                <div className="tips-list">
                  <div className="tip-item">
                    <span className="tip-icon">💡</span>
                    <span className="tip-text">Prepare questions beforehand</span>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">📝</span>
                    <span className="tip-text">Take notes during sessions</span>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">🎯</span>
                    <span className="tip-text">Set clear session goals</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No sessions found</h3>
          <p>
            {user?.role === 'Mentee' 
              ? "You haven't booked any sessions yet." 
              : "You don't have any sessions scheduled."}
          </p>
          {user?.role === 'Mentee' && (
            <Link to="/search" className="btn btn-primary">
              Find a Mentor
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default Sessions;