import { runServer } from './core/setup';

runServer().then((PORT) => {
  console.log(`API Server is now running on http://localhost:${PORT}`);
});