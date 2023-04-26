// Import the built-in 'http' module
const http = require('http');

// Define a function to handle incoming HTTP requests
function handleRequest(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello, World!\n');
}

// Create a new HTTP server and specify the request handler function
const server = http.createServer(handleRequest);

// Start the server listening on port 3000
server.listen(3000, function() {
  console.log('Server listening on http://localhost:3000/');
});
