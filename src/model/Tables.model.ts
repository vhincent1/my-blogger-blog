interface Table {}

// Posts
export interface Posts extends Table {
  id: number | undefined;
  user_id: number | undefined;
  title: string | undefined;
  content: string | undefined;
  labels: string | undefined;
  created_at: Date | undefined;
  updated_at: Date | undefined;
  category: number | undefined;
  source: any;
  status: number | undefined;
}

export const PostsTable: Posts = {
  id: 0,
  user_id: 0,
  title: '',
  content: '',
  labels: '',
  created_at: new Date(),
  updated_at: new Date(),
  category: 0,
  source: undefined,
  status: 0,
};

// Users
export interface Users extends Table {
  id: number | undefined;
  username: string | undefined;
  password: string | undefined;
  email: string | undefined;
  registration_date: Date | undefined;
  role: number | undefined;
}

export const UsersTable: Users = {
  id: 0,
  username: '',
  password: '',
  email: '',
  registration_date: new Date(),
  role: 0,
};

// Hearts
export interface Hearts extends Table {
  post_id: number | undefined;
  user_id: number;
  value: number;
}

export const HeartsTable: Hearts = {
  post_id: 0,
  user_id: 0,
  value: 0,
};

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

function buildJsonSchema(table: Table) {
  const TableName = () => {
    if (table === PostsTable) return 'posts';
    else if (table === UsersTable) return 'users';
    else if (table === HeartsTable) return 'hearts';
    else return 'unknown';
  };
  const getType = (value) => {
    if (typeof value === 'number') return 'INTEGER';
    else if (typeof value === 'string') return 'TEXT';
    else if (typeof value === 'boolean') return 'BOOLEAN';
    else if (typeof value === 'object') {
      if (value instanceof Date) return 'DATE';
      return 'NULL';
    } else return 'TEXT';
  };
  let schema = ``;
  schema += `--- auto-generated JSON Schema for ${TableName()} table ---\n\n`;
  // tables
  schema += `DROP TABLE IF EXISTS ${TableName()};
CREATE TABLE ${TableName()} (
  id INTEGER PRIMARY KEY,
  data JSON
);`;

  // create alter table statements
  schema += `\n\n-- Alter table statements`;
  for (const [key, value] of Object.entries(table)) {
    if (key === 'id') continue; // Skip the primary key column
    schema += `\nALTER TABLE ${TableName()} ADD COLUMN ${key} ${getType(value)} GENERATED ALWAYS AS (json_extract(data, '$.${key}')) VIRTUAL;`;
  }
  // create indexes
  schema += `\n\n-- Create indexes`;
  for (const [key, value] of Object.entries(table)) {
    if (key === 'id') continue; // Skip the primary key column
    schema += `\nCREATE INDEX idx_${TableName()}_${key} ON ${TableName()} (${key});`;
  }
  schema += `\n--- end of ${TableName()} schema ---`;
  return schema;
}

// console.log(buildJsonSchema(PostsTable));
// console.log(buildJsonSchema(UsersTable));
