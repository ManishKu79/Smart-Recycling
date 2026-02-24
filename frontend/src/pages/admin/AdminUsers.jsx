import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminUsers.css';

function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllUsers();
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'user' ? 'admin' : 'user';
    if (window.confirm(`Change user role to ${newRole}?`)) {
      try {
        await api.updateUserRole(userId, newRole);
        alert('✅ User role updated');
        loadUsers();
      } catch (error) {
        alert('❌ Failed to update role: ' + error.message);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await api.toggleUserStatus(userId);
        alert(`✅ User ${action}d successfully`);
        loadUsers();
      } catch (error) {
        alert(`❌ Failed to ${action} user: ` + error.message);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="page-header">
        <h1>Manage Users</h1>
        <p>View and manage user accounts</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="users-table card">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Stats</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{user.fullName}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                </td>
                <td>
                  <div className="user-contact">
                    {user.phone && <span>📞 {user.phone}</span>}
                    {user.city && <span>📍 {user.city}</span>}
                  </div>
                </td>
                <td>
                  <div className="user-stats">
                    <span>⭐ {user.points}</span>
                    <span>⚖️ {user.totalRecycled || 0}kg</span>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRoleChange(user.id, user.role)}
                    >
                      Change Role
                    </button>
                    <button
                      className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-results">
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;