// Database connector stub — removed mongoose dependency.
// The app uses the in-memory store; this module remains for compatibility.

const connectDB = async () => {
  console.log('Database connector: no-op (in-memory mode)');
  return null;
};

module.exports = connectDB;
