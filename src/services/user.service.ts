import User from '../model/User.model.ts';

// Corrected type:
interface MyTypeWithId {
  id: number; // Or number, depending on your id type
  User: typeof User;
}

let s: MyTypeWithId[] = [];

class UserService {
  //UserRepository
  users: User[];

  constructor() {
    this.users = []; // A simple in-memory store for users
  }

  addUser(user: User) {
    if (!user.username) {
      throw new Error('User must have a name and an email.');
    }
    this.users.push(user);
    console.log(`User ${user.username} added successfully.`);
  }

  getUser(name: string) {
    return this.users.find((user) => user.username === name);
  }

  listUsers() {
    return this.users;
  }

  findById(id) {
    return this.users.find((user) => user.id === id);
  }

  async findAllAsync(): Promise<User[]> {
    return this.users;
  }

  async findByIdAsync(id: number): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }
  
  async save() {}
  // async create ( postToCreate ) {
  //   try {
  //     const result = await this.MongooseServiceInstance.create( postToCreate );
  //     return { success: true, body: result };
  //   } catch ( err ) {
  //     return { success: false, error: err };
  //   }
  // }
}

export default UserService;
