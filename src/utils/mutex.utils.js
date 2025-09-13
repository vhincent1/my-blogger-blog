class Mutex {
  constructor() {
    this.lock = Promise.resolve();
  }

  acquire() {
    let release;
    const acquired = new Promise(resolve => {
      release = resolve;
    });
    const locked = this.lock.then(() => release);
    this.lock = acquired;
    return locked;
  }

  async runExclusive(callback) {
    const release = await this.acquire();
    try {
      return await callback();
    } finally {
      release();
    }
  }
}

// Example usage with JSON data
const sharedJsonData = { counter: 0 };
const mutex = new Mutex();

async function incrementCounter() {
  await mutex.runExclusive(async () => {
    sharedJsonData.counter++;
    console.log('Counter:', sharedJsonData.counter);
  });
}

incrementCounter();
incrementCounter();