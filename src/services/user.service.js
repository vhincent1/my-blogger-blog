class UserService {
  constructor() {
    this.users = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
  }

  getUserById(id) {
    return this.users.find(user => user.id === id);
  }

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