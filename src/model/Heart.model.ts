import { SQLiteTable } from './Tables.model.ts';

class Heart {
  post_id: number;
  user_id: number;
  value: number;
  constructor(post_id, user_id, value) {
    this.post_id = post_id;
    this.user_id = user_id;
    this.value = value;
  }
}

class HeartsTable extends SQLiteTable<Heart> {
  version: number;
  tableName: string = 'hearts';
  tableScheme(heart?: Heart) {
    const scheme: { post_id: number; user_id: number; value: number } = {
      post_id: heart?.post_id || 0,
      user_id: heart?.user_id || 0,
      value: heart?.value || 0,
    };
    return scheme;
  }

  mapRowToData(row: any): Heart | null {
    if (!row) return null;
    return new Heart(row.post_id, row.user_id, row.value);
  }
}

export default Heart;
