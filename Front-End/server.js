const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 2990; // Use port 3000 or the one specified in the environment variable

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/service-worker.js', (req, res) => {
  res.setHeader('Content-Type', 'text/javascript');
  res.sendFile(path.join(__dirname, 'public', 'service-worker.js'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
