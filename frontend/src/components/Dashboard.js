import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { showToast } from '../utils/toast';

const Dashboard = ({ user, setView, setUser }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    documentType: '',
    fullName: '',
    purpose: '',
    deliveryMethod: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch requests (stable, only depends on the email)
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3001/my-requests?userId=user::${user.email}`
      );
      console.log('Fetched requests:', res.data);
      setRequests(res.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMessage('Failed to load requests. Please check your connection.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  // FIXED useEffect — no ESLint warning!
  useEffect(() => {
    fetchRequests();
    // fetch notifications for this user
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/notifications?userId=user::${user.email}`);
        if (res.data && res.data.length) {
          setNotifications(res.data);
          // show toasts for each
          res.data.forEach(n => showToast(n.message, 'info'));
          // clear notifications on server after showing
          await axios.post('http://localhost:3001/notifications/clear', { userId: `user::${user.email}` });
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();
  }, [fetchRequests]);

  // Submit request
  const submitRequest = async (e) => {
    e.preventDefault();

    if (!form.documentType || !form.fullName || !form.purpose || !form.deliveryMethod || !form.address) {
      setMessage('Please fill in all fields');
      setIsError(true);
      return;
    }

    setSubmitting(true);

    try {
      await axios.post('http://localhost:3001/submit-request', {
        ...form,
        userId: `user::${user.email}`
      });

      setForm({
        documentType: '',
        fullName: '',
        purpose: '',
        deliveryMethod: '',
        address: ''
      });

      setMessage('Request submitted successfully!');
      setIsError(false);

      fetchRequests(); // Refresh after submission
    } catch (error) {
      console.error('Error submitting request:', error);
      setMessage('Error submitting request');
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.fullName}! 👋</p>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {user.role === 'admin' && (
          <button className="admin-btn" onClick={() => setView('admin')}>Admin View</button>
        )}
        <button onClick={() => { setUser(null); setView('login'); }}>Logout</button>
      </div>
      
      <h3>Submit New Request</h3>
      <form onSubmit={submitRequest}>
        <div className="form-group">
          <select
            value={form.documentType}
            onChange={e => setForm({ ...form, documentType: e.target.value })}
            required
          >
            <option value="">Select Document Type</option>
            <option>Birth Certificate</option>
            <option>Marriage Certificate</option>
            <option>Death Certificate</option>
            <option>CENOMAR</option>
            <option>CENODeath</option>
            <option>Certificate of Indigency</option>
            <option>Certificate of Residency</option>
            <option>Barangay Clearance</option>
            <option>Community Tax Certificate</option>
            <option>Police Clearance</option>
            <option>NBI Clearance</option>
          </select>
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Full Name"
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Purpose"
            value={form.purpose}
            onChange={e => setForm({ ...form, purpose: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <select
            value={form.deliveryMethod}
            onChange={e => setForm({ ...form, deliveryMethod: e.target.value })}
            required
          >
            <option value="">Select Delivery Method</option>
            <option>Pickup</option>
            <option>Mail</option>
          </select>
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            required
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting && <span className="spinner"></span>}
          Submit Request
        </button>
      </form>

      {message && <p className={isError ? 'error' : 'success'}>{message}</p>}

      <h3>My Requests</h3>
      {notifications.length > 0 && (
        <div>
          <h4>🔔 Notifications</h4>
          <ul>
            {notifications.map(n => (
              <li key={n.id}>{n.message} <small>({new Date(n.createdAt).toLocaleString()})</small></li>
            ))}
          </ul>
        </div>
      )}
      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length === 0 ? (
        <p>No requests found. Submit one above!</p>
      ) : (
        <ul>
          {requests.map(r => (
            <li key={r.id}>
              <span>
                {r.documentType} -
                <span className={`status ${r.status ? r.status.toLowerCase() : 'unknown'}`}>
                  {r.status || 'Pending'}
                </span>
              </span>
              <span>{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'N/A'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
