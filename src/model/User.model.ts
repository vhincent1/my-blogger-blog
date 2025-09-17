class User {
  constructor(id, username, password) {
    this.id = id;
    this.username = username;
    this.password = password;
  }

  static async findById(){

  }
  async save(){

  }
  static async findAll(){
    
  }
}

class UserService {
  constructor() {
    this.users = []; // A simple in-memory store for users
  }
  addUser(user) {
    if (!user.name || !user.email) {
      throw new Error('User must have a name and an email.');
    }
    this.users.push(user);
    console.log(`User ${user.name} added successfully.`);
  }
  getUser(email) {
    return this.users.find(user => user.email === email);
  }
  listUsers() {
    return this.users;
  }
}

export default { User };