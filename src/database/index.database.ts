import appConfig from '../app.config.ts';
import { Database } from './Database.model.ts';

const database = new Database(appConfig.database);
await database.load();

export default database;