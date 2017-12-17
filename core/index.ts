import { runServer } from './setup';
import startup from '../app/startup';

try {
  runServer().then(startup);
} catch (errors) {
  console.error(errors);
}