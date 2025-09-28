import React, { useEffect, useState } from "react";
import "./GoogleSheetsIntegration.css";

const GoogleSheetsIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sheetData, setSheetData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newData, setNewData] = useState({
    name: "",
    value: "",
    status: "active",
  });

  // Kiểm tra kết nối khi component mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate connection check
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data for demonstration
      const mockData = [
        ["Ngày", "Sản phẩm", "Số lượng", "Giá", "Trạng thái", "Khách hàng"],
        ["2025-09-28", "Sản phẩm A", "5", "150.000", "Hoàn thành", "Nguyễn Văn A"],
        ["2025-09-28", "Sản phẩm B", "3", "200.000", "Đang xử lý", "Trần Thị B"],
        ["2025-09-27", "Sản phẩm C", "2", "300.000", "Hoàn thành", "Lê Văn C"],
        ["2025-09-27", "Sản phẩm A", "4", "150.000", "Hoàn thành", "Phạm Thị D"],
      ];

      setSheetData(mockData);
      setIsConnected(true);
      setSuccess("✅ Kết nối Google Sheets thành công!");
    } catch (err) {
      setError(`❌ Lỗi kết nối: ${err.message}`);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuccess("✅ Đã cập nhật dữ liệu!");
    } catch (err) {
      setError(`❌ Lỗi refresh: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddData = async () => {
    try {
      const newRow = [
        new Date().toLocaleDateString('vi-VN'),
        newData.name,
        "1",
        newData.value,
        newData.status === "active" ? "Hoàn thành" : "Đang xử lý",
        "Khách hàng mới",
      ];

      setSheetData([...sheetData, newRow]);
      setNewData({ name: "", value: "", status: "active" });
      setOpenDialog(false);
      setSuccess("✅ Đã thêm dữ liệu mới!");
    } catch (err) {
      setError(`❌ Lỗi thêm dữ liệu: ${err.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Hoàn thành":
        return "status-success";
      case "Đang xử lý":
        return "status-warning";
      default:
        return "status-default";
    }
  };

  return (
    <div className="google-sheets-integration">
      <div className="integration-header">
        <h1>📊 Google Sheets Integration</h1>
      </div>

      {/* Status Cards */}
      <div className="status-cards">
        <div className="status-card">
          <h3>Trạng thái kết nối</h3>
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? "🟢 Đã kết nối" : "🔴 Chưa kết nối"}
          </div>
        </div>

        <div className="status-card">
          <h3>Tổng số dòng</h3>
          <div className="metric-value">{sheetData.length}</div>
        </div>

        <div className="status-card">
          <h3>Spreadsheet ID</h3>
          <div className="spreadsheet-id">
            {isConnected ? "demo-spreadsheet-123" : "Chưa kết nối"}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert error">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {success && (
        <div className="alert success">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>×</button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
          onClick={checkConnection}
          disabled={isLoading}
        >
          {isLoading ? "🔄 Đang kết nối..." : "🔗 Kết nối Google Sheets"}
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleRefresh}
          disabled={!isConnected || isLoading}
        >
          🔄 Làm mới dữ liệu
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => setOpenDialog(true)}
          disabled={!isConnected}
        >
          ➕ Thêm dữ liệu
        </button>
      </div>

      {/* Data Table */}
      {isConnected && sheetData.length > 0 && (
        <div className="data-section">
          <h3>📋 Dữ liệu từ Google Sheets</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {sheetData[0]?.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sheetData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>
                        {cellIndex === 4 ? (
                          <span className={`status-badge ${getStatusColor(cell)}`}>
                            {cell}
                          </span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Data Dialog */}
      {openDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h3>Thêm dữ liệu mới</h3>
              <button onClick={() => setOpenDialog(false)} className="close-btn">×</button>
            </div>
            <div className="dialog-content">
              <div className="form-group">
                <label>Tên sản phẩm</label>
                <input
                  type="text"
                  value={newData.name}
                  onChange={(e) => setNewData({ ...newData, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm"
                />
              </div>
              <div className="form-group">
                <label>Giá</label>
                <input
                  type="text"
                  value={newData.value}
                  onChange={(e) => setNewData({ ...newData, value: e.target.value })}
                  placeholder="Nhập giá sản phẩm"
                />
              </div>
            </div>
            <div className="dialog-actions">
              <button onClick={() => setOpenDialog(false)} className="btn btn-secondary">
                Hủy
              </button>
              <button onClick={handleAddData} className="btn btn-primary">
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleSheetsIntegration;
