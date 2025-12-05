import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { showToast } from '../utils/toast';

const Admin = ({ setView, user, setUser }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const fetchAllRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3001/my-requests?userId=all&adminId=user::${user.email}`);
      console.log('Fetched all requests:', res.data);
      // Only show pending requests in the admin list
      const pending = res.data.filter(r => !r.status || r.status.toLowerCase() === 'pending');
      setRequests(pending);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const updateStatus = async (id, status) => {
    console.log('Frontend: Updating ID:', id, 'to status:', status);
    try {
      const res = await axios.post('http://localhost:3001/update-status', { id, status, adminId: `user::${user.email}` });
      console.log('Frontend: Response:', res.data);
      setMessage(`Request ${status.toLowerCase()} successfully!`);
      showToast(`Request ${status.toLowerCase()} successfully!`, 'success');
      setIsError(false);
      // Remove the request from the UI immediately
      setRequests(prev => prev.filter(r => r.id !== id));
      // Also refresh in background to keep state in sync
      fetchAllRequests();
    } catch (error) {
      console.error('Frontend: Update error:', error);
      setMessage('Error updating status');
      showToast('Error updating status', 'error');
      setIsError(true);
    }
  };

  // Ask for confirmation before changing status
  const handleAction = async (requestObj, status) => {
    const name = requestObj.fullName || requestObj.userId || 'the user';
    const doc = requestObj.documentType || 'the document';
    const confirmed = window.confirm(`Are you sure you want to ${status.toLowerCase()} the request for ${name} (${doc})?`);
    if (!confirmed) return;
    await updateStatus(requestObj.id, status);
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      {user && <p>Signed in as: <strong>{user.fullName || user.email}</strong></p>}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={() => setView('dashboard')}>Back to Dashboard</button>
        <button onClick={() => { setUser(null); setView('login'); }}>Logout</button>
      </div>
      
      {message && <p className={isError ? 'error' : 'success'}>{message}</p>}
      
      <h3>All Requests</h3>
      {loading ? <p>Loading requests...</p> : (
        <ul>
          {requests.map(r => (
            <li key={r.id}>
              <div>
                <strong>{r.documentType}</strong> by {r.fullName} - <span className={`status ${r.status ? r.status.toLowerCase() : 'unknown'}`}>{r.status || 'Pending'}</span>
                <br />
                <small>{r.userId} | {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'N/A'}</small>
              </div>
              <div>
                <button onClick={() => handleAction(r, 'Approved')}>✅ Approve</button>
                <button onClick={() => handleAction(r, 'Rejected')}>❌ Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Admin;