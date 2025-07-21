class Report {
  constructor(data) {
    this.id = data.id;
    this.type = data.type;
    this.title = data.title;
    this.description = data.description;
    this.filters = data.filters || {};
    this.data = data.data || {};
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.status = data.status || 'draft'; // draft, generating, completed, failed
    this.fileUrl = data.fileUrl;
    this.expiresAt = data.expiresAt;
  }

  // Mock database
  static reports = [
    {
      id: 1,
      type: 'summary',
      title: 'Weekly Summary Report',
      description: 'Summary of all automation tasks for the week',
      filters: { dateRange: '7d', status: 'all' },
      createdBy: 1,
      status: 'completed',
      createdAt: new Date('2024-12-01'),
      data: {
        totalTasks: 245,
        successfulTasks: 230,
        failedTasks: 15,
        avgExecutionTime: '2m 30s'
      }
    },
    {
      id: 2,
      type: 'detailed',
      title: 'Monthly Detailed Report',
      description: 'Detailed analysis of all automation activities',
      filters: { dateRange: '30d', includeErrors: true },
      createdBy: 1,
      status: 'completed',
      createdAt: new Date('2024-12-05'),
      data: {
        totalTasks: 1247,
        taskBreakdown: [
          { type: 'data_sync', count: 425 },
          { type: 'email_send', count: 312 },
          { type: 'file_process', count: 278 }
        ]
      }
    }
  ];

  static async findAll(filters = {}) {
    let filteredReports = this.reports;

    if (filters.type) {
      filteredReports = filteredReports.filter(r => r.type === filters.type);
    }

    if (filters.createdBy) {
      filteredReports = filteredReports.filter(r => r.createdBy === filters.createdBy);
    }

    if (filters.status) {
      filteredReports = filteredReports.filter(r => r.status === filters.status);
    }

    return filteredReports.map(r => new Report(r));
  }

  static async findById(id) {
    const reportData = this.reports.find(r => r.id === parseInt(id));
    return reportData ? new Report(reportData) : null;
  }

  static async create(reportData) {
    const newReport = {
      id: this.reports.length + 1,
      ...reportData,
      createdAt: new Date(),
      status: 'draft'
    };

    this.reports.push(newReport);
    return new Report(newReport);
  }

  async save() {
    const reportIndex = Report.reports.findIndex(r => r.id === this.id);
    
    if (reportIndex !== -1) {
      this.updatedAt = new Date();
      Report.reports[reportIndex] = { ...this };
    }
    
    return this;
  }

  async delete() {
    const reportIndex = Report.reports.findIndex(r => r.id === this.id);
    
    if (reportIndex !== -1) {
      Report.reports.splice(reportIndex, 1);
      return true;
    }
    
    return false;
  }

  async generateData() {
    // Simulate report generation
    this.status = 'generating';
    await this.save();

    // Mock data generation based on report type
    setTimeout(async () => {
      try {
        switch (this.type) {
          case 'summary':
            this.data = await this._generateSummaryData();
            break;
          case 'detailed':
            this.data = await this._generateDetailedData();
            break;
          case 'performance':
            this.data = await this._generatePerformanceData();
            break;
          case 'error':
            this.data = await this._generateErrorData();
            break;
          default:
            this.data = { message: 'Basic report data' };
        }

        this.status = 'completed';
        await this.save();
      } catch (error) {
        this.status = 'failed';
        this.data = { error: error.message };
        await this.save();
      }
    }, 2000);
  }

  async _generateSummaryData() {
    return {
      totalTasks: Math.floor(Math.random() * 1000) + 500,
      successfulTasks: Math.floor(Math.random() * 900) + 450,
      failedTasks: Math.floor(Math.random() * 50) + 10,
      avgExecutionTime: `${Math.floor(Math.random() * 5) + 1}m ${Math.floor(Math.random() * 60)}s`
    };
  }

  async _generateDetailedData() {
    return {
      taskBreakdown: [
        { type: 'data_sync', count: Math.floor(Math.random() * 300) + 200 },
        { type: 'email_send', count: Math.floor(Math.random() * 200) + 100 },
        { type: 'file_process', count: Math.floor(Math.random() * 150) + 75 },
        { type: 'backup', count: Math.floor(Math.random() * 100) + 50 }
      ],
      timeRange: this.filters.dateRange || '30d',
      generatedAt: new Date().toISOString()
    };
  }

  async _generatePerformanceData() {
    return {
      avgResponseTime: `${Math.floor(Math.random() * 500) + 100}ms`,
      throughput: `${Math.floor(Math.random() * 1000) + 500} req/min`,
      errorRate: `${(Math.random() * 5).toFixed(2)}%`,
      uptime: `${(99 + Math.random()).toFixed(2)}%`
    };
  }

  async _generateErrorData() {
    return {
      totalErrors: Math.floor(Math.random() * 50) + 10,
      errorTypes: [
        { type: 'connection_timeout', count: Math.floor(Math.random() * 20) + 5 },
        { type: 'authentication_failed', count: Math.floor(Math.random() * 10) + 2 },
        { type: 'data_validation', count: Math.floor(Math.random() * 15) + 3 }
      ],
      criticalErrors: Math.floor(Math.random() * 5) + 1
    };
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      filters: this.filters,
      data: this.data,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      status: this.status,
      fileUrl: this.fileUrl,
      expiresAt: this.expiresAt
    };
  }
}

module.exports = Report;
