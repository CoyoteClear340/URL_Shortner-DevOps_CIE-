require('dotenv').config();
const app = require('./app');
const { initializeDatabase } = require('./config/database');

const port = Number(process.env.PORT || 3000);

async function start() {
  await initializeDatabase();
  app.listen(port, () => {
    console.log(`URL shortener listening on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Unable to start application', error);
  process.exitCode = 1;
});
