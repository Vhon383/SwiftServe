const { connectToCouchbase } = require('./app');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASS = process.env.ADMIN_PASS || 'adminpass';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrator';

async function createAdmin() {
  try {
    const { users } = await connectToCouchbase();
    const key = `user::${ADMIN_EMAIL}`;
    const doc = {
      email: ADMIN_EMAIL,
      password: ADMIN_PASS,
      fullName: ADMIN_NAME,
      role: 'admin',
      notifications: []
    };

    // Try to insert; if exists, upsert to ensure role
    try {
      await users.insert(key, doc);
      console.log(`Admin user created: ${ADMIN_EMAIL}`);
    } catch (insertErr) {
      console.log('User exists or insert failed, attempting upsert to ensure admin role...');
      await users.upsert(key, doc);
      console.log(`Admin user upserted: ${ADMIN_EMAIL}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin user:', err.message || err);
    process.exit(1);
  }
}

createAdmin();
