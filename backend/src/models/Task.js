class Task {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.description = data.description;
    this.config = data.config || {};
    this.status = data.status || 'pending'; // pending, running, completed, failed
    this.progress = data.progress || 0;
    this.result = data.result || null;
    this.error = data.error || null;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date();
    this.startedAt = data.startedAt;
    this.completedAt = data.completedAt;
    this.duration = data.duration || 0;
    this.priority = data.priority || 'normal'; // low, normal, high, urgent
    this.scheduled = data.scheduled || false;
    this.schedule = data.schedule || null;
    this.retryCount = data.retryCount || 0;
    this.maxRetries = data.maxRetries || 3;
  }

  // Mock database
  static tasks = [
    {
      id: 1,
      name: 'Daily Google Sheets Sync',
      type: 'google_sheets_sync',
      description: 'Synchronize data with Google Sheets daily',
      config: {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        range: 'Sheet1!A1:Z1000'
      },
      status: 'completed',
      progress: 100,
      createdBy: 1,
      createdAt: new Date('2024-12-07T06:00:00Z'),
      startedAt: new Date('2024-12-07T06:00:30Z'),
      completedAt: new Date('2024-12-07T06:02:45Z'),
      duration: 135,
      result: { recordsProcessed: 1250, recordsUpdated: 45 },
      scheduled: true,
      schedule: 'daily'
    },
    {
      id: 2,
      name: 'Send Weekly Reports',
      type: 'email_send',
      description: 'Send weekly automation reports to stakeholders',
      config: {
        recipients: ['manager@company.com', 'team@company.com'],
        template: 'weekly_report',
        subject: 'Weekly Automation Report'
      },
      status: 'completed',
      progress: 100,
      createdBy: 1,
      createdAt: new Date('2024-12-07T08:30:00Z'),
      startedAt: new Date('2024-12-07T08:30:15Z'),
      completedAt: new Date('2024-12-07T08:31:00Z'),
      duration: 45,
      result: { emailsSent: 2, emailsFailed: 0 },
      scheduled: true,
      schedule: 'weekly'
    },
    {
      id: 3,
      name: 'Process CSV Data',
      type: 'data_processing',
      description: 'Process uploaded CSV file',
      config: {
        sourceType: 'csv',
        sourcePath: '/uploads/data_20241207.csv',
        outputPath: '/processed/data_20241207_processed.json'
      },
      status: 'failed',
      progress: 75,
      createdBy: 2,
      createdAt: new Date('2024-12-07T10:15:00Z'),
      startedAt: new Date('2024-12-07T10:15:30Z'),
      error: 'File not found: /uploads/data_20241207.csv',
      retryCount: 2,
      scheduled: false
    }
  ];

  static async findAll(filters = {}) {
    let filteredTasks = this.tasks;

    if (filters.status) {
      filteredTasks = filteredTasks.filter(t => t.status === filters.status);
    }

    if (filters.type) {
      filteredTasks = filteredTasks.filter(t => t.type === filters.type);
    }

    if (filters.createdBy) {
      filteredTasks = filteredTasks.filter(t => t.createdBy === filters.createdBy);
    }

    if (filters.scheduled !== undefined) {
      filteredTasks = filteredTasks.filter(t => t.scheduled === filters.scheduled);
    }

    // Sort by creation date (newest first)
    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filteredTasks.map(t => new Task(t));
  }

  static async findById(id) {
    const taskData = this.tasks.find(t => t.id === parseInt(id));
    return taskData ? new Task(taskData) : null;
  }

  static async create(taskData) {
    const newTask = {
      id: this.tasks.length + 1,
      ...taskData,
      createdAt: new Date(),
      status: 'pending',
      progress: 0
    };

    this.tasks.push(newTask);
    return new Task(newTask);
  }

  async save() {
    const taskIndex = Task.tasks.findIndex(t => t.id === this.id);
    
    if (taskIndex !== -1) {
      Task.tasks[taskIndex] = { ...this };
    }
    
    return this;
  }

  async delete() {
    const taskIndex = Task.tasks.findIndex(t => t.id === this.id);
    
    if (taskIndex !== -1) {
      Task.tasks.splice(taskIndex, 1);
      return true;
    }
    
    return false;
  }

  async start() {
    if (this.status !== 'pending') {
      throw new Error(`Cannot start task with status: ${this.status}`);
    }

    this.status = 'running';
    this.startedAt = new Date();
    this.progress = 0;
    await this.save();

    // Simulate task execution
    return this._executeTask();
  }

  async _executeTask() {
    try {
      // Simulate different task types
      switch (this.type) {
        case 'google_sheets_sync':
          return await this._executeGoogleSheetsSync();
        case 'email_send':
          return await this._executeEmailSend();
        case 'data_processing':
          return await this._executeDataProcessing();
        default:
          throw new Error(`Unknown task type: ${this.type}`);
      }
    } catch (error) {
      this.status = 'failed';
      this.error = error.message;
      this.completedAt = new Date();
      this.duration = Date.now() - this.startedAt.getTime();
      await this.save();
      throw error;
    }
  }

  async _executeGoogleSheetsSync() {
    // Simulate Google Sheets sync
    for (let i = 0; i <= 100; i += 20) {
      this.progress = i;
      await this.save();
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.status = 'completed';
    this.progress = 100;
    this.completedAt = new Date();
    this.duration = Date.now() - this.startedAt.getTime();
    this.result = {
      recordsProcessed: Math.floor(Math.random() * 1000) + 500,
      recordsUpdated: Math.floor(Math.random() * 100) + 20
    };
    
    await this.save();
    return this.result;
  }

  async _executeEmailSend() {
    // Simulate email sending
    const recipients = this.config.recipients || [];
    
    for (let i = 0; i <= 100; i += 25) {
      this.progress = i;
      await this.save();
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    this.status = 'completed';
    this.progress = 100;
    this.completedAt = new Date();
    this.duration = Date.now() - this.startedAt.getTime();
    this.result = {
      emailsSent: recipients.length,
      emailsFailed: 0
    };
    
    await this.save();
    return this.result;
  }

  async _executeDataProcessing() {
    // Simulate data processing
    for (let i = 0; i <= 100; i += 10) {
      this.progress = i;
      await this.save();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Simulate potential failure
      if (i === 70 && Math.random() < 0.3) {
        throw new Error('Data validation failed');
      }
    }

    this.status = 'completed';
    this.progress = 100;
    this.completedAt = new Date();
    this.duration = Date.now() - this.startedAt.getTime();
    this.result = {
      recordsProcessed: Math.floor(Math.random() * 500) + 100,
      outputFile: this.config.outputPath
    };
    
    await this.save();
    return this.result;
  }

  async retry() {
    if (this.retryCount >= this.maxRetries) {
      throw new Error(`Maximum retries (${this.maxRetries}) exceeded`);
    }

    this.retryCount++;
    this.status = 'pending';
    this.progress = 0;
    this.error = null;
    this.startedAt = null;
    this.completedAt = null;
    
    await this.save();
    return this.start();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      description: this.description,
      config: this.config,
      status: this.status,
      progress: this.progress,
      result: this.result,
      error: this.error,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      duration: this.duration,
      priority: this.priority,
      scheduled: this.scheduled,
      schedule: this.schedule,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries
    };
  }
}

module.exports = Task;
