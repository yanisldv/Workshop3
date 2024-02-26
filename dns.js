// Import required modules
const express = require('express');

// Create an instance of the express server
const app = express();
const port = 3001; // Choose any available port

// Define a route for the getServer endpoint
app.get('/getServer', (req, res) => {
  const serverUrl = `http://localhost:${port}`;
  res.json({ code: 200, server: serverUrl });
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`DNS Registry Server is running on http://localhost:${port}`);
});
