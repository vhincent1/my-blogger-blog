import * as fs from 'node:fs/promises';
// import { Mutex } from 'async-mutex';

// const dbMutex = new Mutex();

async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    // console.log('JSON data:', jsonData.length);
    return jsonData;
  } catch (error) {
    switch (error.code) {
      case 'ENOENT': //file doesn't exist
        return [];
      default:
        console.error('Error reading or parsing JSON:', error);
        throw error;
    }
  }
}

async function writeJsonFile(filePath, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2); // Pretty print JSON
    await fs.writeFile(filePath, jsonString, 'utf8');
    // console.log('JSON data written successfully.');
  } catch (error) {
    console.error('Error writing JSON:', error);
  }
}

export { readJsonFile, writeJsonFile };

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