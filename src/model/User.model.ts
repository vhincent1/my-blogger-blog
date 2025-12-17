import type { SQLiteTable } from './Tables.model.ts';

class User {
  id: number | undefined;
  username: string;
  password: string;
  email: string;
  registration_date: Date;
  role: number | UserRole.USER;

  constructor(id: number | undefined, username: string) {
    this.id = id;
    this.username = username;
  }
}

enum UserRole {
  USER = 0,
  MOD = 1,
}

//users table repoisitory?
// class Users extends User implements SQLiteTable {
//   tableName: string = 'users';

//   createUser(username: string, password: string, email: string): User {
//     const newUser = new User(undefined, username);
//     newUser.password = password;
//     newUser.email = email;
//     newUser.registration_date = new Date();
//     newUser.role = UserRole.USER;
//     return newUser;
//   }
// }

export default User;
