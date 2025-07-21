// src/services/notifications/notificationService.js
import axios from 'axios';
import GoogleSheetsService from '../api/googleSheetsAPI';

class NotificationService {
  constructor() {
    this.channels = {
      email: this.sendEmail.bind(this),
      telegram: this.sendTelegram.bind(this),
      zalo: this.sendZalo.bind(this),
    };
    this.templates = {};
    this.config = {};
  }

  /**
   * Khởi tạo notification service với config
   */
  async initialize() {
    try {
      // Load config từ Google Sheets
      this.config = await GoogleSheetsService.getSystemConfig();

      // Load templates
      await this.loadTemplates();

      console.log('Notification service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  /**
   * Load notification templates từ Google Sheets
   */
  async loadTemplates() {
    try {
      const templatesData = await GoogleSheetsService.getSheetData('NotificationTemplates');

      this.templates = templatesData.reduce((acc, template) => {
        acc[template.templateId] = {
          id: template.templateId,
          name: template.name,
          subject: template.subject,
          content: template.content,
          channels: JSON.parse(template.channels || '[]'),
          variables: JSON.parse(template.variables || '[]'),
          isActive: template.isActive === 'true',
        };
        return acc;
      }, {});

      console.log('Notification templates loaded:', Object.keys(this.templates).length);
    } catch (error) {
      console.error('Failed to load notification templates:', error);
    }
  }

  /**
   * Gửi notification đa kênh
   * @param {Object} notification - Notification data
   */
  async sendNotification(notification) {
    const {
      templateId,
      recipients,
      channels = ['email'],
      variables = {},
      priority = 'normal',
      scheduleTime = null,
    } = notification;

    try {
      // Validate template
      const template = this.templates[templateId];
      if (!template || !template.isActive) {
        throw new Error(`Template ${templateId} not found or inactive`);
      }

      // Process variables
      const processedContent = this.processTemplate(template, variables);

      // Send to each channel
      const results = await Promise.allSettled(
        channels.map(async (channel) => {
          if (!this.channels[channel]) {
            throw new Error(`Unsupported channel: ${channel}`);
          }

          return await this.channels[channel]({
            ...processedContent,
            recipients: recipients[channel] || recipients.default || [],
            priority,
            scheduleTime,
          });
        }),
      );

      // Log results
      await this.logNotification({
        templateId,
        recipients,
        channels,
        variables,
        results: results.map((result, index) => ({
          channel: channels[index],
          status: result.status,
          result: result.status === 'fulfilled' ? result.value : result.reason,
        })),
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Process template với variables
   */
  processTemplate(template, variables) {
    let subject = template.subject;
    let content = template.content;

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      content = content.replace(regex, value);
    });

    return { subject, content };
  }

  /**
   * Gửi email thông qua EmailJS hoặc SMTP
   */
  async sendEmail({ subject, content, recipients, priority }) {
    try {
      const emailConfig = this.config.email || {};

      if (emailConfig.service?.value === 'emailjs') {
        // EmailJS implementation
        const emailjs = window.emailjs;

        const promises = recipients.map((recipient) =>
          emailjs.send(
            emailConfig.serviceId?.value,
            emailConfig.templateId?.value,
            {
              to_email: recipient.email,
              to_name: recipient.name,
              subject,
              message: content,
              from_name: emailConfig.fromName?.value || 'OAS System',
            },
            emailConfig.publicKey?.value,
          ),
        );

        const results = await Promise.allSettled(promises);

        return {
          channel: 'email',
          success: results.every((r) => r.status === 'fulfilled'),
          sent: results.filter((r) => r.status === 'fulfilled').length,
          failed: results.filter((r) => r.status === 'rejected').length,
          details: results,
        };
      } else {
        // SMTP implementation (Node.js backend required)
        const response = await axios.post('/api/notifications/email', {
          recipients,
          subject,
          content,
          priority,
          config: emailConfig,
        });

        return response.data;
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  /**
   * Gửi Telegram message
   */
  async sendTelegram({ subject, content, recipients, priority }) {
    try {
      const telegramConfig = this.config.telegram || {};
      const botToken = telegramConfig.botToken?.value;

      if (!botToken) {
        throw new Error('Telegram bot token not configured');
      }

      const message = `*${subject}*

${content}`;

      const promises = recipients.map(async (recipient) => {
        const chatId = recipient.chatId || recipient.telegramId;

        return axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
          disable_notification: priority === 'low',
        });
      });

      const results = await Promise.allSettled(promises);

      return {
        channel: 'telegram',
        success: results.every((r) => r.status === 'fulfilled'),
        sent: results.filter((r) => r.status === 'fulfilled').length,
        failed: results.filter((r) => r.status === 'rejected').length,
        details: results,
      };
    } catch (error) {
      console.error('Telegram sending failed:', error);
      throw new Error(`Telegram sending failed: ${error.message}`);
    }
  }

  /**
   * Gửi Zalo message
   */
  async sendZalo({ subject, content, recipients, priority }) {
    try {
      const zaloConfig = this.config.zalo || {};
      const accessToken = zaloConfig.accessToken?.value;
      const appId = zaloConfig.appId?.value;

      if (!accessToken || !appId) {
        throw new Error('Zalo configuration incomplete');
      }

      const promises = recipients.map(async (recipient) => {
        const userId = recipient.zaloId || recipient.userId;

        // Zalo Official Account API
        return axios.post(
          'https://openapi.zalo.me/v2.0/oa/message',
          {
            recipient: {
              user_id: userId,
            },
            message: {
              text: `${subject}

${content}`,
            },
          },
          {
            headers: {
              access_token: accessToken,
              'Content-Type': 'application/json',
            },
          },
        );
      });

      const results = await Promise.allSettled(promises);

      return {
        channel: 'zalo',
        success: results.every((r) => r.status === 'fulfilled'),
        sent: results.filter((r) => r.status === 'fulfilled').length,
        failed: results.filter((r) => r.status === 'rejected').length,
        details: results,
      };
    } catch (error) {
      console.error('Zalo sending failed:', error);
      throw new Error(`Zalo sending failed: ${error.message}`);
    }
  }

  /**
   * Log notification activity
   */
  async logNotification(logData) {
    try {
      await GoogleSheetsService.addSheetData('NotificationLogs', {
        ...logData,
        results: JSON.stringify(logData.results),
      });
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  /**
   * Lấy notification history
   */
  async getNotificationHistory(filters = {}) {
    try {
      return await GoogleSheetsService.getSheetData('NotificationLogs', {
        filter: (row) => {
          if (filters.templateId && row.templateId !== filters.templateId) return false;
          if (filters.channel && !row.channels.includes(filters.channel)) return false;
          if (filters.dateFrom && new Date(row.timestamp) < new Date(filters.dateFrom))
            return false;
          if (filters.dateTo && new Date(row.timestamp) > new Date(filters.dateTo)) return false;
          return true;
        },
        sort: (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      });
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  /**
   * Test notification channels
   */
  async testChannels() {
    const testMessage = {
      templateId: 'test',
      recipients: {
        email: [{ email: 'test@example.com', name: 'Test User' }],
        telegram: [{ chatId: '123456789' }],
        zalo: [{ zaloId: '123456789' }],
      },
      channels: ['email', 'telegram', 'zalo'],
      variables: {
        message: 'This is a test notification',
        timestamp: new Date().toISOString(),
      },
    };

    // Create temporary test template
    this.templates.test = {
      id: 'test',
      name: 'Test Template',
      subject: 'Test Notification',
      content: '{{message}} - Sent at {{timestamp}}',
      channels: ['email', 'telegram', 'zalo'],
      isActive: true,
    };

    try {
      const result = await this.sendNotification(testMessage);
      delete this.templates.test; // Clean up
      return result;
    } catch (error) {
      delete this.templates.test; // Clean up
      throw error;
    }
  }

  /**
   * Schedule notification
   */
  async scheduleNotification(notification, scheduleTime) {
    // In production, this would integrate with a job queue like Bull or Agenda
    const delay = new Date(scheduleTime) - new Date();

    if (delay > 0) {
      setTimeout(() => {
        this.sendNotification(notification);
      }, delay);

      return {
        success: true,
        scheduledAt: scheduleTime,
        delay,
      };
    } else {
      throw new Error('Schedule time must be in the future');
    }
  }

  /**
   * Get available templates
   */
  getTemplates() {
    return Object.values(this.templates).filter((template) => template.isActive);
  }

  /**
   * Get notification statistics
   */
  async getStatistics(dateRange = '7d') {
    try {
      const logs = await this.getNotificationHistory({
        dateFrom: this.getDateFromRange(dateRange),
      });

      const stats = {
        total: logs.length,
        byChannel: {},
        byTemplate: {},
        successRate: 0,
        failed: 0,
      };

      logs.forEach((log) => {
        const results = JSON.parse(log.results);

        // By channel
        log.channels.forEach((channel) => {
          stats.byChannel[channel] = (stats.byChannel[channel] || 0) + 1;
        });

        // By template
        stats.byTemplate[log.templateId] = (stats.byTemplate[log.templateId] || 0) + 1;

        // Success/failure
        const allSuccess = results.every((r) => r.status === 'fulfilled');
        if (!allSuccess) stats.failed++;
      });

      stats.successRate =
        stats.total > 0 ? (((stats.total - stats.failed) / stats.total) * 100).toFixed(2) : 0;

      return stats;
    } catch (error) {
      console.error('Failed to get notification statistics:', error);
      return null;
    }
  }

  /**
   * Helper: Get date from range string
   */
  getDateFromRange(range) {
    const now = new Date();
    const days = parseInt(range.replace('d', ''));
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  }
}

export default new NotificationService();
