let requests;
let users;

module.exports.setRequests = (r) => { requests = r; };
module.exports.setUsers = (u) => { users = u; };

exports.submit = async (req, res) => {
  const id = Date.now().toString();
  const request = { id, userId: req.body.userId, ...req.body, status: 'Pending', submittedAt: new Date().toISOString() };
  try {
    await requests.insert(`request::${id}`, request);
    res.json({ id, message: 'Request submitted' });
  } catch (error) {
    res.status(500).json({ error: 'Submission failed' });
  }
};

exports.getMy = async (req, res) => {
  const userId = req.query.userId;
  try {
    let query;
    if (userId === 'all') {
      // Admin-only: validate adminId provided and that it is an admin
      const adminId = req.query.adminId;
      if (!adminId) return res.status(403).json({ error: 'adminId required' });
      try {
        const ares = await users.get(adminId);
        const auser = ares.content || ares.value || {};
        if (auser.role !== 'admin') return res.status(403).json({ error: 'Admin privileges required' });
      } catch (err) {
        return res.status(403).json({ error: 'Admin not found' });
      }
      query = `SELECT r.* FROM \`e-services\`.\`_default\`.\`requests\` r`;
    } else {
      query = `SELECT r.* FROM \`e-services\`.\`_default\`.\`requests\` r WHERE r.userId = '${userId}'`;
    }
    const result = await requests.cluster.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Query error:', error.message);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id, status } = req.body;
  const key = `request::${id}`;
  console.log('Attempting to update request ID:', id, 'to status:', status);
  try {
    // Fetch existing document, merge status, then upsert full document
    const getResult = await requests.get(key);
    const doc = (getResult && (getResult.value || getResult.content)) ? (getResult.value || getResult.content) : {};
    doc.status = status;
    // Only allow admin to update status: require adminId in body
    const adminId = req.body.adminId;
    if (!adminId) return res.status(403).json({ error: 'adminId required' });
    try {
      const ares = await users.get(adminId);
      const auser = ares.content || ares.value || {};
      if (auser.role !== 'admin') return res.status(403).json({ error: 'Admin privileges required' });
    } catch (err) {
      return res.status(403).json({ error: 'Admin not found' });
    }

    await requests.upsert(key, doc);
    console.log('Status updated for key:', key);
    res.json({ message: 'Status updated' });
    // Send a notification to the requesting user (if users collection available)
    try {
      if (users && doc.userId) {
        const note = {
          id: Date.now().toString(),
          message: `Your request for ${doc.documentType || 'a document'} was ${status}.`,
          requestId: id,
          status,
          createdAt: new Date().toISOString()
        };
        try {
          const ures = await users.get(doc.userId);
          const udoc = ures.content || ures.value || {};
          udoc.notifications = udoc.notifications || [];
          udoc.notifications.unshift(note);
          await users.upsert(doc.userId, udoc);
          console.log('Notification sent to', doc.userId);
        } catch (uerr) {
          // If user not found or upsert failed, just log it
          console.error('Failed to push notification to user', doc.userId, uerr.message || uerr);
        }
      }
    } catch (notifErr) {
      console.error('Notification handling error:', notifErr.message || notifErr);
    }
  } catch (error) {
    console.error('Update error for ID', id, ':', error.message);
    // If document doesn't exist, return 404
    if (error && error.message && error.message.toLowerCase().includes('not found')) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.status(500).json({ error: 'Update failed' });
  }
};