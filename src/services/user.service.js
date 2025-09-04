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
}

export default new UserService();