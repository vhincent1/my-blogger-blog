import statusMonitor from 'express-status-monitor';
export default statusMonitor({
  path: '/status',
  spans: [
    {
      interval: 1, // Every second
      retention: 60, // Keep 60 datapoints in memory
    },
    {
      interval: 5, // Every 5 seconds
      retention: 60,
    },
    {
      interval: 15, // Every 15 seconds
      retention: 60,
    },
  ],
  chartVisibility: {
    cpu: true,
    mem: true,
    load: true,
    eventLoop: true,
    heap: true,
    responseTime: true,
    rps: true,
    statusCodes: true,
  },
  ignoreStartsWith: '/admin',
  // Add your custom health check endpoint here
  healthChecks: [
    // {
    //   // The URL the health check endpoint will be served on
    // //   route: '/api/v1/health',
    //   protocol: 'http',
    //   host: 'localhost',
    //   port: 3000,
    //   path: '/health', //name
    //   // A function that returns the health check details
    //   // This function will be called to get health data
    //   func: (_req, res, next) => {
    //     // Add your own checks for database connectivity, external services, etc.
    //     const healthcheck = {
    //       uptime: process.uptime(),
    //       message: 'OK',
    //       timestamp: Date.now(),
    //     };
    //     try {
    //       // If everything is healthy, send a 200 OK response
    //       res.status(200).json(healthcheck);
    //     } catch (error) {
    //       // If there's an error, set the message and send a 503 Service Unavailable
    //       healthcheck.message = error;
    //       res.status(503).json(healthcheck);
    //     }
    //   },
    // },
    {
      protocol: 'http',
      host: 'localhost',
      path: '/api/v1/health',
      port: '3000',
    },
    {
      protocol: 'http',
      host: 'localhost',
      path: '/api/v1/posts',
      port: '3000',
    },
  ],
});