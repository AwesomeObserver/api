import { runServer } from './core/setup';

runServer().then((GG) => {  
  console.log(`API Server is now running on http://localhost:${8000}`);
});