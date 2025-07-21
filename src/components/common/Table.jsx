// src/components/common/Table.jsx
import { GetApp as ExportIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import {
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  useMediaQuery,
} from '@mui/material';
import { useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import Button from './Button';

const StyledTableContainer = styled(TableContainer)`
  && {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: ${(props) => props.theme.colors.background.paper};

    .MuiTable-root {
      min-width: 650px;

      @media (max-width: 768px) {
        min-width: 100%;
      }
    }

    .MuiTableHead-root {
      background: ${(props) => props.theme.colors.background.accent};

      .MuiTableCell-root {
        font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
        color: ${(props) => props.theme.colors.text.primary};
        border-bottom: 2px solid ${(props) => props.theme.colors.border.light};
        padding: 16px;

        @media (max-width: 768px) {
          padding: 12px 8px;
          font-size: 0.875rem;
        }
      }
    }

    .MuiTableBody-root {
      .MuiTableRow-root {
        transition: ${(props) => props.theme.animations.transition.fast};

        &:hover {
          background: ${(props) => props.theme.colors.action.hover};
        }

        &.selected {
          background: ${(props) => props.theme.colors.primary[50]};
        }

        .MuiTableCell-root {
          padding: 16px;
          border-bottom: 1px solid ${(props) => props.theme.colors.border.light};

          @media (max-width: 768px) {
            padding: 12px 8px;
            font-size: 0.875rem;
          }
        }
      }
    }

    .MuiTablePagination-root {
      border-top: 1px solid ${(props) => props.theme.colors.border.light};
      background: ${(props) => props.theme.colors.background.accent};

      .MuiTablePagination-toolbar {
        padding: 8px 16px;

        @media (max-width: 768px) {
          padding: 8px;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
      }
    }
  }
`;

const MobileCard = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    background: ${(props) => props.theme.colors.background.paper};
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .title {
        font-weight: ${(props) => props.theme.typography.fontWeight.semibold};
        color: ${(props) => props.theme.colors.text.primary};
      }
    }

    .card-content {
      display: grid;
      gap: 8px;

      .field {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .label {
          font-size: 0.875rem;
          color: ${(props) => props.theme.colors.text.secondary};
          font-weight: ${(props) => props.theme.typography.fontWeight.medium};
        }

        .value {
          font-size: 0.875rem;
          color: ${(props) => props.theme.colors.text.primary};
        }
      }
    }
  }
`;

const TableActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const FilterChips = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Table = ({
  columns = [],
  data = [],
  loading = false,
  selectable = false,
  sortable = true,
  filterable = true,
  exportable = true,
  pagination = true,
  rowsPerPageOptions = [10, 25, 50, 100],
  defaultRowsPerPage = 10,
  onRowSelect,
  onRowClick,
  onSort,
  onFilter,
  onExport,
  actions = [],
  mobileKeyField = 'id',
  emptyMessage = 'Không có dữ liệu',
  className,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [actionRowId, setActionRowId] = useState(null);
  const [filters, setFilters] = useState({});

  // Sorting
  const handleSort = (property) => {
    if (!sortable) return;

    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';

    setOrder(newOrder);
    setOrderBy(property);
    onSort?.(property, newOrder);
  };

  // Selection
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => row[mobileKeyField]);
      setSelected(newSelected);
      onRowSelect?.(newSelected);
    } else {
      setSelected([]);
      onRowSelect?.([]);
    }
  };

  const handleSelect = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
    onRowSelect?.(newSelected);
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Actions Menu
  const handleActionClick = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setActionRowId(rowId);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setActionRowId(null);
  };

  // Sorting and filtering
  const sortedAndFilteredData = useMemo(() => {
    let result = [...data];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) =>
          String(row[key]).toLowerCase().includes(String(value).toLowerCase()),
        );
      }
    });

    // Apply sorting
    if (orderBy) {
      result.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];

        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, order, orderBy]);

  // Paginated data
  const paginatedData = pagination
    ? sortedAndFilteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sortedAndFilteredData;

  // Render cell content
  const renderCellContent = (column, row) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }

    const value = row[column.key];

    if (column.type === 'status') {
      return <Chip label={value} color={column.statusColors?.[value] || 'default'} size="small" />;
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString('vi-VN');
    }

    if (column.type === 'currency') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(value);
    }

    return value;
  };

  if (isMobile) {
    return (
      <div className={className}>
        {/* Mobile Actions */}
        <TableActions>
          {exportable && (
            <Button variant="outline" startIcon={<ExportIcon />} onClick={onExport} size="sm">
              Xuất dữ liệu
            </Button>
          )}
        </TableActions>

        {/* Mobile Cards */}
        {paginatedData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.text.secondary }}>
            {emptyMessage}
          </div>
        ) : (
          paginatedData.map((row) => (
            <MobileCard key={row[mobileKeyField]} onClick={() => onRowClick?.(row)}>
              <div className="card-header">
                <div className="title">{columns[0] && renderCellContent(columns[0], row)}</div>
                {actions.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(e, row[mobileKeyField]);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}
              </div>

              <div className="card-content">
                {columns.slice(1).map((column) => (
                  <div key={column.key} className="field">
                    <span className="label">{column.title}</span>
                    <span className="value">{renderCellContent(column, row)}</span>
                  </div>
                ))}
              </div>
            </MobileCard>
          ))
        )}

        {/* Mobile Pagination */}
        {pagination && (
          <TablePagination
            component="div"
            count={sortedAndFilteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            labelRowsPerPage="Số dòng:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Desktop Actions */}
      <TableActions>
        {selectable && selected.length > 0 && (
          <span style={{ color: theme.colors.text.secondary }}>Đã chọn {selected.length} mục</span>
        )}

        {exportable && (
          <Button variant="outline" startIcon={<ExportIcon />} onClick={onExport} size="sm">
            Xuất dữ liệu
          </Button>
        )}
      </TableActions>

      {/* Filter Chips */}
      {Object.keys(filters).length > 0 && (
        <FilterChips>
          {Object.entries(filters).map(([key, value]) => (
            <Chip
              key={key}
              label={`${key}: ${value}`}
              onDelete={() => {
                const newFilters = { ...filters };
                delete newFilters[key];
                setFilters(newFilters);
                onFilter?.(newFilters);
              }}
              size="small"
            />
          ))}
        </FilterChips>
      )}

      {/* Desktop Table */}
      <StyledTableContainer>
        <MuiTable>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}

              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  sortDirection={orderBy === column.key ? order : false}
                  style={{ minWidth: column.minWidth }}
                >
                  {sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.key}
                      direction={orderBy === column.key ? order : 'asc'}
                      onClick={() => handleSort(column.key)}
                    >
                      {column.title}
                    </TableSortLabel>
                  ) : (
                    column.title
                  )}
                </TableCell>
              ))}

              {actions.length > 0 && <TableCell align="right">Thao tác</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  style={{ textAlign: 'center', padding: '40px' }}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => {
                const isSelected = selected.indexOf(row[mobileKeyField]) !== -1;

                return (
                  <TableRow
                    key={row[mobileKeyField]}
                    hover
                    className={isSelected ? 'selected' : ''}
                    onClick={() => onRowClick?.(row)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelect(row[mobileKeyField])}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell key={column.key}>{renderCellContent(column, row)}</TableCell>
                    ))}

                    {actions.length > 0 && (
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(e, row[mobileKeyField]);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </MuiTable>

        {/* Desktop Pagination */}
        {pagination && (
          <TablePagination
            component="div"
            count={sortedAndFilteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count !== -1 ? count : `hơn ${to}`}`
            }
          />
        )}
      </StyledTableContainer>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleActionClose}>
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              action.onClick(actionRowId);
              handleActionClose();
            }}
            disabled={action.disabled}
          >
            {action.icon && <span style={{ marginRight: 8 }}>{action.icon}</span>}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default Table;
