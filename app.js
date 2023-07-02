// app.mjs
const express = require("express");
const http = require("http");
const app = express();

let maxConcurrentUsers = 3;
let activeUsersCount = 0;
const userQueue = [];
let isShuttingDown = false;

const sendTooManyRequestsResponse = (res) => {
  res.status(429).json({
    message: "Too many requests. Please wait and try again later.",
    positionInQueue: userQueue.length,
  });
};

const processNextUserRequest = () => {
  if (userQueue.length > 0 && activeUsersCount < maxConcurrentUsers) {
    const nextUserRequest = userQueue.shift();
    nextUserRequest.cb(() => {
      console.log("processed the queued request");
      // Callback to decrement activeUsersCount after the request is processed.
      activeUsersCount--;
      processNextUserRequest(); // After processing one request, check for the next queued request.
    });
    activeUsersCount++;
  }
};

const concurrentUserLimitMiddleware = (req, res, next) => {
  if (isShuttingDown) {
    return res.status(503).json({ message: "Server is shutting down." });
  }

  if (activeUsersCount < maxConcurrentUsers) {
    activeUsersCount++;
    next();
  } else {
    console.log("pushed to queue");
    userQueue.push({
      cb: (cb) => {
        // Process the request and respond to the user.
        // For demonstration purposes, we'll just simulate a delay before responding.
        setTimeout(() => {
          if (!appServer.listening) {
            // Server is shutting down or restarting, handle the situation
            cb(new Error("Server is shutting down."));
          } else {
            cb(); // Call cb to indicate that the processing is complete.
          }
        }, 3000); // Simulate processing time of 3 seconds.
      },
    });
    sendTooManyRequestsResponse(res);
  }
};

// setInterval(processNextUserRequest, 1000); // Adjust the interval as needed.

// Use the concurrentUserLimitMiddleware in your routes.
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
  }, 2000); // Simulate processing time of 5 seconds.

  function clear() {
    clearTimeout(timer);
  }
});

app.get("/user-limit", (req, res) => {
  const { limit } = req.query;

  if (limit > 0) {
    maxConcurrentUsers = limit;
    return res
      .status(200)
      .json({ message: "Max concurrent users limit increased." });
  }

  res.status(400).json({ message: "Invalid limit" });
});

const appServer = app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

const closeServer = () => {
  return new Promise((resolve, reject) => {
    if (!isShuttingDown) {
      isShuttingDown = true;
      console.log("Server is shutting down...");

      // Set a timeout to forcefully close the server if it doesn't close gracefully
      const forceCloseTimeout = setTimeout(() => {
        console.log("Server force-closed after timeout.");
        appServer.close(() => {
          console.log("Server is forcefully terminated.");
          resolve();
        });
      }, 5000);

      processNextUserRequest();
      // Try to close the server gracefully
      appServer.close(() => {
        clearTimeout(forceCloseTimeout);
        console.log("Server is gracefully terminated.");
        resolve();
      });
    } else {
      resolve();
    }
  });
};

process.on("SIGINT", async () => {
  await closeServer();
  process.exit(0);
});

const resetActiveUsersCount = () => {
  activeUsersCount = 0;
};

module.exports = { appServer, closeServer, resetActiveUsersCount };
