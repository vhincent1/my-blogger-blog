interface Table {}

// Posts
export interface Posts extends Table {
  id: any;
  user_id: any;
  title: any;
  content: any;
  labels: any;
  created_at: any;
  updated_at: any;
  category: any;
  source: any;
  status: any;
}

export const PostsTable: Posts = {
  id: undefined,
  user_id: undefined,
  title: undefined,
  content: undefined,
  labels: undefined,
  created_at: Date,
  updated_at: Date,
  category: undefined,
  source: undefined,
  status: undefined,
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
  id: undefined,
  username: undefined,
  password: undefined,
  email: undefined,
  registration_date: undefined,
  role: undefined,
};

export interface Hearts extends Table {
  post_id: number;
  user_id: number;
  value: number;
}

export const HeartsTable: Hearts = {
  post_id: 0,
  user_id: 0,
  value: 0,
};
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
