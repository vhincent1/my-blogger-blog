class User {
  public id: number;
  public username: string;
  public password?: string; //hash
  public email?: string;
  public date: any = {
    registered: undefined,
  };
  public role: number = UserRole.USER;

  constructor(id: number, username: string) {
    this.id = id;
    this.username = username;
  }
}

enum UserRole {
  USER = 0,
  MOD = 1,
}

export default User;
