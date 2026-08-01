import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from '@mui/material';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
}

interface Props<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
}

/** Generic reusable table: pass columns + rows, optionally wire server-side pagination props. */
export default function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading,
  onRowClick,
  emptyMessage,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
}: Props<T>) {
  const { t } = useTranslation();
  const paginated = page !== undefined && rowsPerPage !== undefined && onPageChange;

  return (
    <Paper variant="outlined">
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align ?? 'left'} sx={{ width: col.width, fontWeight: 700 }}>
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">{emptyMessage ?? t('common.noResults')}</Typography>
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              rows.map((row) => (
                <TableRow
                  key={getRowKey(row)}
                  hover={!!onRowClick}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align ?? 'left'}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {paginated && (
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <TablePagination
            component="div"
            count={totalCount ?? rows.length}
            page={page}
            onPageChange={(_, newPage) => onPageChange(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
            rowsPerPageOptions={rowsPerPageOptions}
            labelRowsPerPage={t('common.rowsPerPage')}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} ${t('common.of')} ${count}`}
          />
        </Box>
      )}
    </Paper>
  );
}
