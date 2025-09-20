class User {
  public id: number;
  public username: string;
  public password?: string
  // public email?: string

  constructor(id: number, username: string, password: string) {
    this.id = id;
    this.username = username;
    this.password = password;
  }
}

export default User;