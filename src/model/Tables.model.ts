interface Table {}

export abstract class SQLiteTable<T> implements Table {
  abstract version: number;
  abstract tableName: string;

  #db;
  constructor(db) {
    this.#db = db;
  }
  
  abstract tableScheme(model?: T);
  abstract mapRowToData(row): T | null;

  fetchAll(): T[] {
    const statement = this.#db.prepare(`SELECT * FROM ${this.tableName} ORDER BY id DESC`); //ASC - recent, DESC - oldest
    const rows = statement.all();
    return rows.map((row) => this.mapRowToData(this.version === 2 ? JSON.parse(row.data) : row));
  }

  findById(id: number): T | null {
    const statement = this.#db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    const row = statement.get(id);
    const data = this.version === 2 ? JSON.parse(row.data) : row;
    return this.mapRowToData(data);
  }

  generateSchema(): any {
    //prettier-ignore
    function getType(value) {
      if (value === null) return 'NULL';
      if (value instanceof Date) return 'DATE';
      switch (typeof value) {
        case 'number': return 'INTEGER';
        case 'boolean': return 'BOOLEAN';
        case 'string': default: return 'TEXT';
      }
    }
    let _schema = ``;
    _schema += `--- auto-generated JSON schema for ${this.tableName} table ---\n`;
    // tables
    _schema += `DROP TABLE IF EXISTS ${this.tableName};
CREATE TABLE ${this.tableName} (
  id INTEGER PRIMARY KEY,
  data JSON
);\n`;

    const entries = Object.entries(this.tableScheme()).filter(([key]) => key !== 'id' && key !== 'tableName' && key !== 'version');

    // create alter table statements
    _schema += `-- Alter table statements\n`;
    entries.forEach(([key, value]) => {
      _schema += `ALTER TABLE ${this.tableName} ADD COLUMN ${key} ${getType(key)} GENERATED ALWAYS AS (json_extract(data, '$.${key}')) VIRTUAL;\n`;
    });

    // create indexes
    _schema += `-- Create indexes\n`;
    entries.forEach(([key, value]) => {
      _schema += `CREATE INDEX idx_${this.tableName}_${key} ON ${this.tableName} (${key});\n`;
    });
    _schema += `--- end of schema ---`;
    return _schema;
  }

  importData(data: any[]) {
    // Insert sample data if the table is empty
    // const count = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    // if (count === 0) {
    //   const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    //   for (let i = 1; i <= 50; i++) {
    //     insert.run(`User ${i}`, `user${i}@example.com`);
    //   }
    // }
    console.log('importing data into', this.tableName, 'table');
    let checkTable = this.#db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(this.tableName);
    if (!checkTable) {
      console.error("posts table doesn't exist, use setup()");
      return;
    }

    const query = `INSERT OR REPLACE INTO ${this.tableName} (id, data) VALUES (?, ?);`;
    const insertStmt = this.#db.prepare(query);

    const insertData = this.#db.transaction((dataArray) => {
      for (const data of dataArray) {
        const schema = this.tableScheme(data);

        if (this.version === 1) {
          const columns = Object.keys(schema).join(', ');
          // prettier-ignore
          const placeholders = Object.keys(schema).map((col) => `:${col}`).join(', ');
          const query = `INSERT OR REPLACE INTO ${this.tableName} (${columns}) VALUES (${placeholders});`;
          const insertStmt = this.#db.prepare(query);
          insertStmt.run(schema);
        } else if (this.version === 2) {
          //json
          const insertStmt = this.#db.prepare(`INSERT OR REPLACE INTO ${this.tableName} (id, data) VALUES (?, ?);`);
          insertStmt.run(schema.id, JSON.stringify(schema));
        }
      }
      const result = this.#db.prepare(`SELECT count(*) AS count FROM ${this.tableName}`);
      console.log('Successfully inserted', result.get().count, this.tableName, 'rows');
    });
    try {
      insertData(data);
    } catch (error) {
      console.error(error);
    }
  }

  insertData(values: any) {
    console.log('Inserting data into', this.tableName, 'table');
    //json
    if (this.version === 1) {
      const columns = Object.keys(values).join(', ');
      // prettier-ignore
      const placeholders = Object.keys(values).map((key) => `:${key}`).join(', ');
      const insertStatement = this.#db.prepare(`INSERT OR REPLACE INTO ${this.tableName} (${columns}) VALUES (${placeholders})`);
      const info = insertStatement.run(values);
      // console.log('Number of rows changed:', info.changes, '@ Row:', info.lastInsertRowid);
      return info;
    } else if (this.version === 2) {
      const query = `INSERT OR REPLACE INTO ${this.tableName} (id, data) VALUES (?, ?)`;
      const statement = this.#db.prepare(query).run(values.id, JSON.stringify(values));
      return statement;
    }
  }
}

// Utils
/**
 * Generates the dynamic ON DUPLICATE KEY UPDATE clause.
 * @param {object} data The object containing column names.
 * @returns {string} The SQL fragment (e.g., "col1=VALUES(col1), col2=VALUES(col2)")
 */
export function buildDuplicateKeyUpdateClause(data) {
  const columns = Object.keys(data).filter((key) => key !== 'id'); // Exclude primary key 'id' from the update list
  const updateClauses = columns.map((col) => `${col} = VALUES(${col})`);
  return updateClauses.join(', ');
}

// console.log(buildJsonSchema(PostsTable));
// console.log(buildJsonSchema(UsersTable));

// console.log(buildJsonSchema());
// console.log(buildJsonSchema({...new Hearts2()}))
// console.log(new Hearts().generateSchema());
