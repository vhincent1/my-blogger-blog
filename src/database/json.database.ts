import * as fs from 'node:fs/promises';
import { Mutex } from 'async-mutex';
import appConfig from '../app.config.ts';
import type { Post } from '../model/Post.model.ts';

import type Heart from '../model/Heart.model.ts';
import type { DatabaseI } from '../model/DatabaseI.model.ts';

const dbMutex = new Mutex();

export async function readJsonFile(filePath) {
  console.log('reading');
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    console.log(jsonData.length);
    return jsonData;
  } catch (error: any) {
    switch (error.code) {
      case 'ENOENT': //file doesn't exist
        return [];
      default:
        console.error('Error reading or parsing JSON:', error);
        throw error;
    }
  }
}

export async function writeJsonFile(filePath, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2); // Pretty print JSON
    await fs.writeFile(filePath, jsonString, 'utf8');
    // console.log('JSON data written successfully.');
  } catch (error) {
    console.error('Error writing JSON:', error);
  }
}

// export { readJsonFile, writeJsonFile };
class JSONDatabase implements DatabaseI {
  config; //type,file,host
  blogPosts;
  // users;
  // comments;
  constructor(config) {
    this.config = config;
  }
  findPostById(id: number): Post | null {
    throw new Error('Method not implemented.');
  }
  getHearts(): Heart[] {
    throw new Error('Method not implemented.');
  }

  setup(dropExistingTables): void {
    throw new Error('Method not implemented.');
  }

  close(): void {
    // throw new Error('Method not implemented.');
    console.log('close');
  }

  async importPosts2(file, data) {
    writeJsonFile(file, data);
  }

  importPosts(posts) {
    throw new Error('Method not implemented.');
  }

  async load() {
    // console.log('loading');
    const release = await dbMutex.acquire();
    try {
      this.blogPosts = await readJsonFile(this.config.file);
    } catch (error) {
      console.log('Database error: ', error);
    } finally {
      release();
    }
  }

  //select
  getAllBlogPosts(): Post[] {
    // this.load()
    const posts: Post[] = this.blogPosts;
    return posts.reverse();
  }

  //insert
  async createPost(post) {
    const release = await dbMutex.acquire();
    try {
      this.blogPosts.push(post);
    } catch (error) {
      console.log('Database error: ', error);
    } finally {
      release();
    }
  }

  //update
  async savePosts() {
    const release = await dbMutex.acquire();
    try {
      await writeJsonFile(appConfig.database.file, this.blogPosts);
    } catch (error) {
      console.log('Database error: ', error);
    } finally {
      release();
    }
  }

  //delete
  async delete() {}
  heartPost(id, user, value) {
    throw new Error('Method not implemented.');
  }
}
const database = new JSONDatabase(appConfig.database);
export default database;

// --- API Endpoints with Mutex Protection ---
/*
// Endpoint to list all products
app.get('/products', async (req, res) => {
    const release = await dbMutex.acquire(); // Acquire the mutex
    try {
        const db = await readDb();
        res.json(db.products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read data' });
    } finally {
        release(); // Ensure the mutex is always released
    }
});
// Endpoint to update a product's stock (critical section)
app.post('/products/update-stock', async (req, res) => {
    const { id, quantity } = req.body;
    
    // Acquire the mutex, blocking other write operations
    const release = await dbMutex.acquire();
    
    try {
        const db = await readDb();
        const product = db.products.find(p => p.id === id);

        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        if (product.stock + quantity < 0) {
            res.status(400).json({ error: 'Insufficient stock' });
            return;
        }

        // Simulate a delay to expose the race condition without a mutex
        console.log(`[Start] Updating product ${id}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        product.stock += quantity;
        await writeDb(db);
        
        console.log(`[Done]  Updated product ${id}, new stock: ${product.stock}`);

        res.status(200).json({
            message: `Stock updated for product ${product.name}`,
            product: product
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        // Release the mutex, allowing other tasks to proceed
        release();
    }
});
*/
