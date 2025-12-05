   const couchbase = require('couchbase');

   // Use the new connect method (async, non-deprecated)
   async function connectToCouchbase() {
     const cluster = await couchbase.connect('couchbase://localhost', {
       username: 'Admin',
       password: '2203184975',
     });
     const bucket = cluster.bucket('e-services');
     const users = bucket.collection('users');
     const requests = bucket.collection('requests');
     return { users, requests };
   }

   module.exports = { connectToCouchbase };
   