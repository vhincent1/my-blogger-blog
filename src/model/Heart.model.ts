class Heart {
  id: number;
  user_id: number;
  value: number;
  constructor(post_id, user_id, value) {
    this.id = post_id;
    this.user_id = user_id;
    this.value = value;
  }
}

export default Heart;
