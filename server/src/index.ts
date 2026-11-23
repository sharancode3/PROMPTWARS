import { app } from './app.js';
import { logger } from './utils/logger.js';

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, '0.0.0.0', () => {
  logger.info({ port: PORT }, `LabLink API server listening on http://0.0.0.0:${PORT}`);
});
