import Heart from '../../model/Heart.model.ts';
import { SQLiteTable } from '../../model/Tables.model.ts';

export class HeartsTable extends SQLiteTable<Heart> {
  version: number = 2;
  tableName: string = 'hearts';

  tableScheme(heart?: Heart) {
    const scheme: { id: number; user_id: number; value: number } = {
      id: heart?.id || 0,
      user_id: heart?.user_id || 0,
      value: heart?.value || 0,
    };
    return scheme;
  }

  mapRowToData(row: any): Heart | null {
    if (!row) return null;
    return new Heart(row.id, row.user_id, row.value);
  }

  heartPost(postId, userId, value = 1) {
    //     const existingLike = await db.query('SELECT * FROM likes WHERE item_id = ? AND user_id = ?', [itemId, userId]);
    //     let newLikeCount;
    //     if (existingLike.length > 0) {
    //       // User already liked, so unlike it (or toggle dislike)
    //       await db.query('DELETE FROM likes WHERE item_id = ? AND user_id = ?', [itemId, userId]);
    //       newLikeCount = await db.query('SELECT COUNT(*) AS count FROM likes WHERE item_id = ? AND value = 1', [itemId]);
    //     } else {
    //       // User has not liked, so add a like
    //       await db.query('INSERT INTO likes (item_id, user_id, value) VALUES (?, ?, 1)', [itemId, userId]);
    //       newLikeCount = await db.query('SELECT COUNT(*) AS count FROM likes WHERE item_id = ? AND value = 1', [itemId]);
    //     }
    //     res.json({ message: 'Like status updated', newLikeCount: newLikeCount[0].count });
    //   } catch (error) {
    //     console.error('Database error:', error);
    //     res.status(500).json({ error: 'Internal server error' });
    //   }

    const existingLike = this.getDatabase().prepare(`SELECT * FROM ${this.tableName} WHERE id = ? AND JSON_EXTRACT(data, '$.user_id') = ?`);
    let result = existingLike.all(postId, userId);

    // console.log(id, user_id);
    // console.log(result)

    // const stmt = this.getDatabase().prepare(`SELECT * FROM hearts WHERE JSON_EXTRACT(data, '$.id') = ?`);
    // console.log('existing:', stmt.all(1));

    // return;

    if (result.length > 0) {
      // User already liked, so unlike it (or toggle dislike)
      result = this.delete({ id: postId }, 'user_id', userId);
      // const toggle = this.getDatabase().prepare(`DELETE FROM ${this.tableName} WHERE id = ? AND user_id = ?`);
      // result = toggle.run(id, user_id);
      console.log('unheart:');
      // return
    } else {
      // User has not liked, so add a like
      // const toggle = this.getDatabase().prepare(`INSERT OR REPLACE INTO ${this.tableName} (id, user_id, value) VALUES (?, ?, ?)`);
      // result = toggle.run(id, user_id, value);

      const newHeart = new Heart(postId, userId, value);
      result = this.insert(newHeart, true);
      console.log('heart:');
    }

    const newLikeCount = this.getDatabase().prepare(`SELECT COUNT(*) AS count FROM ${this.tableName} WHERE id = ? AND value = 1`);
    console.log('new like count for post_id:', postId, '=', newLikeCount.get(postId).count);

    console.log('Number of rows changed:', result.changes, '@ Row:', result.lastInsertRowid);

    //prettier-ignore
    // const placeholders = Object.keys(HeartsTable).map((col) => `:${col}`).join(', ');
    // const columns = Object.keys(HeartsTable).join(', ');

    // const insertStatement = this.db.prepare(`INSERT OR REPLACE INTO hearts (${columns}) VALUES (${placeholders});`);
    // const values: Hearts = {
    //   post_id: id,
    //   user_id: user_id,
    //   value: value,
    // };

    // const info = insertStatement.run(values);
    // console.log(info)
  }
}
