import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDatabaseIfEmpty } from './seed/seeder.js';

import authRoutes from './routes/authRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import cronRoutes from './routes/cronRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CivicFix MERN Backend', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api', statsRoutes);
app.use('/api/cron', cronRoutes);

app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

async function startServer() {
  await connectDB();
  await seedDatabaseIfEmpty();

  app.listen(PORT, () => {
    console.log(`[CivicFix MERN Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
