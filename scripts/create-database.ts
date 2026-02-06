import database from '../src/database/index.database.ts';

const createDatabase = () => {
  database.setup({ dropExistingTables: true });
  database.importPosts;
};

createDatabase();
