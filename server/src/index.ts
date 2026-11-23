import { app } from './app.js';

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LabLink API server listening on http://0.0.0.0:${PORT}`);
});
