let users;

module.exports.setUsers = (u) => { users = u; };

exports.register = async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    // default role to 'user' unless explicitly provided
    const role = req.body.role || 'user';
    await users.insert(`user::${email}`, { email, password, fullName, role });
    res.json({ message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await users.get(`user::${email}`);
    if (user.content.password === password) {
      res.json({ user: user.content });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    res.status(401).json({ error: 'User not found' });
  }
};

exports.getNotifications = async (req, res) => {
  const userId = req.query.userId;
  try {
    const ures = await users.get(userId);
    const udoc = ures.content || ures.value || {};
    const notes = udoc.notifications || [];
    res.json(notes);
  } catch (error) {
    console.error('Get notifications error:', error.message || error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.clearNotifications = async (req, res) => {
  const { userId } = req.body;
  try {
    const ures = await users.get(userId);
    const udoc = ures.content || ures.value || {};
    udoc.notifications = [];
    await users.upsert(userId, udoc);
    res.json({ message: 'Notifications cleared' });
  } catch (error) {
    console.error('Clear notifications error:', error.message || error);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
};