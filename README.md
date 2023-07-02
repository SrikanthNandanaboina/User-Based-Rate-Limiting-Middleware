# Concurrent User Limit Middleware in Express.js
The Concurrent User Limit Middleware is a feature developed for an Express.js application to control the number of concurrent users accessing certain routes. It allows you to set a maximum limit on the number of users allowed to concurrently access a specific route. If the limit is reached, additional requests will be queued and processed once a slot becomes available.
<br>

# How It Works
The Concurrent User Limit Middleware is implemented using a queue-based approach. When a user sends a request to the protected route, the middleware checks the number of active users against the maximum concurrent user limit. If the limit is not reached, the user's request is processed immediately. However, if the limit is exceeded, the user's request is queued and processed once a slot becomes available.
<br> <br>
The middleware also handles server shutdown gracefully. When the server is shutting down or restarting, any incoming requests will receive a 503 Service Unavailable response.

# How to Use It

## Installation
```ruby
npm install
```
How to run
```ruby
npm start
```

# Protected Routes
To use the Concurrent User Limit Middleware in your application, you can apply it to specific routes that require limiting concurrent users. For example:
```ruby
// Apply the concurrentUserLimitMiddleware to the "/queue" route
app.get("/queue", concurrentUserLimitMiddleware, (req, res) => {
  // Handle the user's request.
  // For demonstration purposes, we'll just simulate a delay before responding.
  const timer = setTimeout(() => {
    if (isShuttingDown) {
      return res.status(503).json({ message: "Server is shutting down." });
    }
    activeUsersCount--;
    processNextUserRequest();
    res.status(200).json({ message: "Your request has been processed." });
    clear();
  }, 2000); // Simulate processing time of 2 seconds.

  function clear() {
    clearTimeout(timer);
  }
});
```
# Modifying the Limit

To modify the maximum concurrent user limit dynamically, you can use the /user-limit route.

Example: To increase the concurrent user limit to 5, send a GET request to /user-limit?limit=5.

```ruby
curl http://localhost:3000/user-limit?limit=5
```

# Testing the concurrent requests execution

Execute the below code in the terminal to see the execution process of max concurrent requests at a time.
```ruby
curl --location 'http://127.0.0.1:3000/queue' & curl --location 'http://127.0.0.1:3000/queue' & curl --location 'http://127.0.0.1:3000/queue' & curl --location 'http://127.0.0.1:3000/queue' & curl --location 'http://127.0.0.1:3000/queue' & curl --location 'http://127.0.0.1:3000/queue' & curl --location 'http://127.0.0.1:3000/queue' & curl --location 'http://127.0.0.1:3000/queue' & curl --location 'http://127.0.0.1:3000/queue'
```

# Graceful Server Shutdown
To gracefully shut down the server, you can send a SIGINT signal (e.g., using Ctrl+C) to trigger the shutdown process.

```ruby
# Send SIGINT signal (Ctrl+C) to gracefully shut down the server
```
When the server receives the SIGINT signal, it will stop accepting new requests, process any ongoing requests, and then close the server gracefully.

# Important Notes
1. The provided code uses setTimeout to simulate processing time for user requests. In a real-world scenario, you would replace the setTimeout with the actual processing logic of your application.
2. The maxConcurrentUsers variable controls the maximum number of concurrent users allowed for a protected route. You can adjust this value based on your application's requirements.
3. The middleware uses a simple queue to manage user requests. Depending on your application's needs, you might consider using more robust task queue libraries like bull, kue, or agenda.

# Conclusion
The Concurrent User Limit Middleware helps control the number of concurrent users accessing certain routes in your Express.js application. By using a queue-based approach, it ensures that user requests are processed efficiently and provides a graceful server shutdown mechanism. You can easily modify the concurrent user limit dynamically to adjust to varying traffic demands.
