// Import required modules
const express = require('express');

// Create an instance of the express server
const app = express();
const port = 3001; // Choose any available port

// Define a route for the root endpoint
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
