const handleShutdown = (server, signal) => {
  console.log('sigint received, shutting down');

  //closeDatabase()
  server.close(() => {
    console.log('server closed');
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

export { handleShutdown };
