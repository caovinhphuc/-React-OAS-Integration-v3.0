// src/services/utils/importExportService.js
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import GoogleSheetsService from '../api/googleSheetsAPI';

class ImportExportService {
  constructor() {
    this.supportedImportFormats = ['csv', 'xlsx', 'xls', 'json'];
    this.supportedExportFormats = ['csv', 'xlsx', 'json', 'pdf'];
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.processing = false;
  }

  /**
   * Import file với validation và progress tracking
   * @param {File} file - File để import
   * @param {Object} options - Import options
   */
  async importFile(file, options = {}) {
    if (this.processing) {
      throw new Error('Another import is already in progress');
    }

    try {
      this.processing = true;

      // Validate file
      await this.validateFile(file);

      // Determine file type
      const fileType = this.getFileType(file.name);

      // Parse file based on type
      let data;
      switch (fileType) {
        case 'csv':
          data = await this.parseCsv(file, options);
          break;
        case 'xlsx':
        case 'xls':
          data = await this.parseExcel(file, options);
          break;
        case 'json':
          data = await this.parseJson(file, options);
          break;
        default:
          throw new Error(`Unsupported file format: ${fileType}`);
      }

      // Validate data structure
      if (options.validateSchema) {
        data = await this.validateDataSchema(data, options.schema);
      }

      // Transform data if needed
      if (options.transform) {
        data = await this.transformData(data, options.transform);
      }

      // Log import activity
      await GoogleSheetsService.logUserActivity(
        options.userEmail,
        'import_file',
        {
          fileName: file.name,
          fileSize: file.size,
          recordCount: data.length,
          fileType
        }
      );

      return {
        success: true,
        data,
        meta: {
          fileName: file.name,
          fileSize: file.size,
          recordCount: data.length,
          fileType,
          importedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    } finally {
      this.processing = false;
    }
  }

  /**
   * Export data trong nhiều format khác nhau
   * @param {Array} data - Dữ liệu để export
   * @param {Object} options - Export options
   */
  async exportData(data, options = {}) {
    const {
      format = 'xlsx',
      fileName = `export_${Date.now()}`,
      headers = null,
      sheetName = 'Sheet1',
      userEmail = null
    } = options;

    try {
      let result;

      switch (format.toLowerCase()) {
        case 'csv':
          result = await this.exportToCsv(data, { fileName, headers });
          break;
        case 'xlsx':
          result = await this.exportToExcel(data, { fileName, headers, sheetName });
          break;
        case 'json':
          result = await this.exportToJson(data, { fileName });
          break;
        case 'pdf':
          result = await this.exportToPdf(data, { fileName, headers });
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Log export activity
      if (userEmail) {
        await GoogleSheetsService.logUserActivity(
          userEmail,
          'export_data',
          {
            fileName: result.fileName,
            format,
            recordCount: data.length,
            exportedAt: new Date().toISOString()
          }
        );
      }

      return result;

    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Validate uploaded file
   */
  async validateFile(file) {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Check file type
    const fileType = this.getFileType(file.name);
    if (!this.supportedImportFormats.includes(fileType)) {
      throw new Error(`Unsupported file format. Supported formats: ${this.supportedImportFormats.join(', ')}`);
    }

    // Check file corruption (basic check)
    try {
      const sample = await this.readFileSample(file, 1024); // Read first 1KB
      if (!sample || sample.length === 0) {
        throw new Error('File appears to be empty or corrupted');
      }
    } catch (error) {
      throw new Error('Unable to read file - it may be corrupted');
    }

    return true;
  }

  /**
   * Parse CSV file
   */
  async parseCsv(file, options = {}) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: options.hasHeader !== false,
        encoding: options.encoding || 'UTF-8',
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim(),
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  }

  /**
   * Parse Excel file
   */
  async parseExcel(file, options = {}) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          const sheetName = options.sheetName || workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          if (!worksheet) {
            reject(new Error(`Sheet "${sheetName}" not found`));
            return;
          }

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: options.hasHeader !== false ? 1 : undefined,
            raw: false,
            defval: ''
          });

          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Excel parsing failed: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Parse JSON file
   */
  async parseJson(file, options = {}) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);

          // Ensure data is array
          const data = Array.isArray(jsonData) ? jsonData : [jsonData];
          resolve(data);
        } catch (error) {
          reject(new Error(`JSON parsing failed: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read JSON file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Export to CSV
   */
  async exportToCsv(data, options = {}) {
    const { fileName, headers } = options;

    const csv = Papa.unparse(data, {
      header: true,
      columns: headers
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const fullFileName = `${fileName}.csv`;

    this.downloadBlob(blob, fullFileName);

    return {
      success: true,
      fileName: fullFileName,
      size: blob.size
    };
  }

  /**
   * Export to Excel
   */
  async exportToExcel(data, options = {}) {
    const { fileName, headers, sheetName } = options;

    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const fullFileName = `${fileName}.xlsx`;
    this.downloadBlob(blob, fullFileName);

    return {
      success: true,
      fileName: fullFileName,
      size: blob.size
    };
  }

  /**
   * Export to JSON
   */
  async exportToJson(data, options = {}) {
    const { fileName } = options;

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const fullFileName = `${fileName}.json`;
    this.downloadBlob(blob, fullFileName);

    return {
      success: true,
      fileName: fullFileName,
      size: blob.size
    };
  }

  /**
   * Export to PDF
   */
  async exportToPdf(data, options = {}) {
    const { fileName, headers } = options;

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text('Data Export', 20, 20);

    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);

    // Prepare table data
    const tableHeaders = headers || Object.keys(data[0] || {});
    const tableData = data.map(row => tableHeaders.map(header => row[header] || ''));

    // Add table
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [66, 165, 245]
      }
    });

    const pdfBlob = doc.output('blob');
    const fullFileName = `${fileName}.pdf`;

    this.downloadBlob(pdfBlob, fullFileName);

    return {
      success: true,
      fileName: fullFileName,
      size: pdfBlob.size
    };
  }

  /**
   * Validate data schema
   */
  async validateDataSchema(data, schema) {
    if (!schema) return data;

    const validatedData = [];
    const errors = [];

    data.forEach((row, index) => {
      const validatedRow = {};
      let hasError = false;

      Object.entries(schema).forEach(([field, rules]) => {
        const value = row[field];

        // Required field check
        if (rules.required && (value === undefined || value === null || value === '')) {
          errors.push(`Row ${index + 1}: ${field} is required`);
          hasError = true;
          return;
        }

        // Type validation
        if (value !== undefined && value !== null && value !== '') {
          if (rules.type === 'number' && isNaN(value)) {
            errors.push(`Row ${index + 1}: ${field} must be a number`);
            hasError = true;
          } else if (rules.type === 'email' && !this.isValidEmail(value)) {
            errors.push(`Row ${index + 1}: ${field} must be a valid email`);
            hasError = true;
          } else if (rules.type === 'date' && !this.isValidDate(value)) {
            errors.push(`Row ${index + 1}: ${field} must be a valid date`);
            hasError = true;
          }
        }

        // Custom validation
        if (rules.validate && typeof rules.validate === 'function') {
          const validationResult = rules.validate(value, row);
          if (validationResult !== true) {
            errors.push(`Row ${index + 1}: ${field} - ${validationResult}`);
            hasError = true;
          }
        }

        validatedRow[field] = value;
      });

      if (!hasError) {
        validatedData.push(validatedRow);
      }
    });

    if (errors.length > 0) {
      throw new Error(`Validation failed:
${errors.join('
')}`);
    }

    return validatedData;
  }

  /**
   * Transform data
   */
  async transformData(data, transformConfig) {
    return data.map(row => {
      const transformedRow = { ...row };

      Object.entries(transformConfig).forEach(([field, transform]) => {
        if (typeof transform === 'function') {
          transformedRow[field] = transform(row[field], row);
        } else if (typeof transform === 'object') {
          // Field mapping
          if (transform.from && transform.to) {
            transformedRow[transform.to] = row[transform.from];
            delete transformedRow[transform.from];
          }

          // Value mapping
          if (transform.map && transform.map[row[field]]) {
            transformedRow[field] = transform.map[row[field]];
          }
        }
      });

      return transformedRow;
    });
  }

  /**
   * Utility functions
   */
  getFileType(fileName) {
    return fileName.split('.').pop().toLowerCase();
  }

  async readFileSample(file, bytes) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const slice = file.slice(0, bytes);

      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read file sample'));

      reader.readAsText(slice);
    });
  }

  downloadBlob(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Get processing status
   */
  isProcessing() {
    return this.processing;
  }

  /**
   * Get supported formats
   */
  getSupportedFormats() {
    return {
      import: this.supportedImportFormats,
      export: this.supportedExportFormats
    };
  }
}

export default new ImportExportService();