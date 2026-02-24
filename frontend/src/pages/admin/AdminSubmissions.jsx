// frontend/src/pages/admin/AdminSubmissions.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminSubmissions.css';

function AdminSubmissions() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, [filter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await api.getAllSubmissions({ status: filter });
      setSubmissions(data.submissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Approve this submission?')) {
      try {
        await api.approveSubmission(id);
        alert('✅ Submission approved');
        loadSubmissions();
      } catch (error) {
        alert('❌ Failed to approve: ' + error.message);
      }
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await api.rejectSubmission(id, reason);
        alert('❌ Submission rejected');
        loadSubmissions();
      } catch (error) {
        alert('❌ Failed to reject: ' + error.message);
      }
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="admin-submissions">
      <div className="page-header">
        <h1>Manage Submissions</h1>
        <p>Review and process recycling submissions</p>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      <div className="submissions-table">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Waste Type</th>
              <th>Weight</th>
              <th>Points</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <tr key={sub.id}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{sub.user?.fullName}</span>
                    <span className="user-email">{sub.user?.email}</span>
                  </div>
                </td>
                <td className="waste-type">{sub.wasteType}</td>
                <td>{sub.weight} kg</td>
                <td className="points">{sub.pointsEarned}</td>
                <td>{new Date(sub.date).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(sub.status)}`}>
                    {sub.status}
                  </span>
                </td>
                <td>
                  {sub.status === 'pending' && (
                    <div className="action-buttons">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApprove(sub.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReject(sub.id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {submissions.length === 0 && (
          <div className="no-results">
            <p>No submissions found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminSubmissions;