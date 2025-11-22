import database from "../database/index.database.ts";

const handleShutdown = (server, signal) => {
  console.log('sigint received, shutting down');

  //closeDatabase()
  database.close()
  server.close(() => {
    console.log('server closed');
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

export { handleShutdown };
