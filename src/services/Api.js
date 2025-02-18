class ApiQueue {
    constructor(delayMs = 1000) {
      this.queue = [];
      this.isProcessing = false;
      this.delayMs = delayMs;
    }
  
    async add(task) {
      return new Promise((resolve, reject) => {
        this.queue.push({ task, resolve, reject });
        this.process();
      });
    }
  
    async process() {
      if (this.isProcessing || this.queue.length === 0) return;
      
      this.isProcessing = true;
      const { task, resolve, reject } = this.queue.shift();
      
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      
      // Wait before processing next request
      await new Promise(resolve => setTimeout(resolve, this.delayMs));
      this.isProcessing = false;
      this.process();
    }
  }