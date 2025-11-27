
class UserRepository {
  users = [
    { id: 0, name: 'host' },
    { id: 1, name: 'VHINCENT' },
  ];
  constructor(config) {
    if (config.type == 'sqlite') {
      // SQLiteDatabase;
    }
  }

  setup() {}

  getUserById(id: number) {
    return this.users.find((u) => u.id == id)?.name;
  }
}

import appConfig from '../app.config.ts';

export default new UserRepository(appConfig.database);
