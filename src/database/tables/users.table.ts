import { SQLiteTable } from "../../model/Tables.model.ts";
import User from "../../model/User.model.ts";

export class UsersTable extends SQLiteTable<User> {
  version: number = 2;
  tableName: string = 'users';
  tableScheme(user?: User | undefined) {
    const scheme: {
      id: number | undefined;
      username: string;
      password: string;
      email: string;
      registration_date: Date;
      role: number;
    } = {
      id: user?.id || undefined,
      username: user?.username || '',
      password: user?.password || '',
      email: user?.email || '',
      registration_date: user?.registration_date || new Date(),
      role: 0,
    };
    return scheme;
  }

  mapRowToData(row): User | null {
    if (!row) return null;
    const user = new User(row.id, row.username);
    user.password = row.password_hash;
    user.email = row.email;
    // user.date = {
    //   registered: new Date(row.registration_date),
    // };
    user.registration_date = row.registration_date;
    user.role = row.role;
    return user;
  }
}

console.log(new UsersTable(null).generateSchema())