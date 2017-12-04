import { runServer } from './setup';
import startup from '../app/startup';

runServer().then(startup);