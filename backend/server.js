  console.log('Starting backend server...');
const express = require('express');
const cors = require('cors');  // Add this
console.log('Express loaded successfully');
const app = express();
app.use(cors());  // Add this
app.use(express.json());
console.log('Express app configured');
// ... rest of your code (connection, routes, etc.)
   // Initialize Couchbase connection asynchronously
   const { connectToCouchbase } = require('./app');
   let users, requests;

   connectToCouchbase().then(({ users: u, requests: r }) => {
     users = u;
     requests = r;
     console.log('Couchbase connected successfully');
     
     // Set collections in controllers AFTER connection
    require('./controllers/auth').setUsers(users);
    const reqController = require('./controllers/requests');
    reqController.setRequests(requests);
    // provide users collection to requests controller so it can send notifications
    reqController.setUsers(users);
     
     // Load controllers after connection
      const auth = require('./controllers/auth');
     console.log('Controllers loaded successfully');

     // Routes
     app.post('/register', auth.register);
     app.post('/login', auth.login);
     app.post('/submit-request', reqController.submit);
     app.get('/my-requests', reqController.getMy);
     app.post('/update-status', reqController.updateStatus);
    // Notifications endpoints
    app.get('/notifications', auth.getNotifications);
    app.post('/notifications/clear', auth.clearNotifications);

     console.log('Routes configured, attempting to start server...');
     app.listen(3001, () => console.log('Backend server running on port 3001'));
   }).catch(err => {
     console.error('Failed to connect to Couchbase:', err.message);
     process.exit(1);  // Exit on failure
   });
   