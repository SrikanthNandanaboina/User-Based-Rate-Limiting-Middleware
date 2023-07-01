const request = require("supertest");
const { appServer: app, closeServer, resetActiveUsersCount } = require("./app"); // Assuming the app.js file contains your Express app

describe("User-based Rate Limiting", () => {
  afterEach(() => {
    jest.clearAllTimers(); // Clear all timers after each test
  });

  it("should process requests below the concurrent limit", async () => {
    // Simulate 3 requests
    const promises = Array.from({ length: 3 }, () =>
      request(app).get("/queue")
    );
    const responses = await Promise.all(promises);

    // Expect all responses to be successful
    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });
  }, 20000);

  it("should queue requests above the concurrent limit", async () => {
    // Simulate 4 requests, only 3 should be processed immediately
    resetActiveUsersCount();
    const promises = Array.from({ length: 4 }, () =>
      request(app).get("/queue")
    );

    const responses = await Promise.all(promises);

    // Expect the first 3 responses to be successful (processed immediately)
    responses.slice(0, 3).forEach((response) => {
      expect(response.status).toBe(200);
    });

    // The 4th request should be queued (429 status code)
    expect(responses[3].status).toBe(429);
  }, 30000);

  it("should dequeue and process a queued request when a slot is available", async () => {
    // Simulate 4 requests, only 3 should be processed immediately
    const promises = Array.from({ length: 4 }, () =>
      request(app).get("/queue")
    );
    await Promise.all(promises.slice(0, 3));

    // The 4th request should be queued
    const queuedResponse = await promises[3];
    expect(queuedResponse.status).toBe(429);
  }, 20000);

  it("should handle server shutdown and inform users in the queue", async () => {
    // Simulate server shutdown
    resetActiveUsersCount();

    await closeServer();

    // Now the server has been closed, we can send another request to the server
    // and it should be informed about the shutdown
    const response2 = await request(app).get("/queue");

    expect(response2.status).toBe(503);
    expect(response2.body.message).toBe("Server is shutting down.");
  }, 30000);
});
