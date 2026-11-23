import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Health check endpoint
app.get('/api/v1/healthz', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'lablink-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
