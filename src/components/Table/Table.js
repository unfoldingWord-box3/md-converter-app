import React, {
  useMemo,
  useState,
  useEffect,
} from 'react';
import {
  useTable,
  usePagination,
} from 'react-table';
import { makeStyles } from '@material-ui/core/styles';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Pagination from '../Pagination'
import HtmlTooltip from '../HtmlTooltip';
import IndeterminateCheckbox from '../IndeterminateCheckbox';

export default function Table({
  data,
  columns,
  fetchData,
  sourceNoteVersion,
  pageCount: controlledPageCount,
}) {
  const classes = useStyles();
  // Use the state and functions returned from useTable to build your UI
  const {
    prepareRow,
    allColumns,
    headerGroups,
    getTableProps,
    getTableBodyProps,
    getToggleHideAllColumnsProps,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      data,
      columns,
      manualPagination: true,
      autoResetHiddenColumns: false,
      pageCount: controlledPageCount,
      initialState: {
        pageIndex: 0,
        hiddenColumns: ['ID', 'SupportReference', 'OrigQuote', 'Occurrence', 'Quote', 'Tags'],
      },
    },
    usePagination
  );

  useEffect(() => {
    fetchData({ pageIndex, pageSize })
  }, [fetchData, pageIndex, pageSize])

  const Headers = useMemo(() => {
    return headerGroups.map((headerGroup) => (
      <TableRow {...headerGroup.getHeaderGroupProps()}>
        {headerGroup.headers.map((column) => {
          const tCellStyle = {};
          if (column.Header === "Chapter" || column.Header === "Verse" || column.Header === "Book") {
            tCellStyle.width = '10px';
            tCellStyle.padding = '12px 2px';
          }

          return (
            <TableCell {...column.getHeaderProps()} style={tCellStyle}>
              {column.render('Header')}
            </TableCell>
          )
        })}
      </TableRow>
    ))
  }, [headerGroups])

  const TableRows = useMemo(() => {
    return page.map((row, i) => {
      prepareRow(row);
      return (
        <TableRow {...row.getRowProps()}>
          {row.cells.map((cell, key) => <Record key={key} cell={cell} />)}
        </TableRow>
      );
    })
  }, [page, prepareRow])

  // Render the UI for your table
  return (
    <div className={classes.root}>
      <div className={classes.checkboxes}>
        <div className={classes.checkbox}>
          <IndeterminateCheckbox {...getToggleHideAllColumnsProps()} classes={classes} />
          All
        </div>
        {allColumns.map(column => {
          return (
            <div key={column.id} className={classes.checkbox}>
              <label className={classes.checkboxLabel}>
                <input type="checkbox" {...column.getToggleHiddenProps()} />{' '}
                {column.id}
              </label>
            </div>
        )})}
      </div>
      <MaUTable {...getTableProps()}>
        <TableHead>
          {Headers}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {TableRows}
        </TableBody>
      </MaUTable>
      {sourceNoteVersion && <h4>{sourceNoteVersion}</h4>}
      <Pagination
        page={page}
        gotoPage={gotoPage}
        nextPage={nextPage}
        pageCount={pageCount}
        pageOptions={pageOptions}
        canNextPage={canNextPage}
        setPageSize={setPageSize}
        previousPage={previousPage}
        canPreviousPage={canPreviousPage}
        pageIndex={pageIndex}
        pageSize={pageSize}
        controlledPageCount={controlledPageCount}
      />
    </div>
  );
}

const Record = ({
  cell,
}) => {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const tCellStyle = { color: 'grey' };

  if (cell.column.Header === "Chapter" || cell.column.Header === "Verse" || cell.column.Header === "Book") {
    tCellStyle.width = '10px';
    tCellStyle.padding = '12px 0px';
  }

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <HtmlTooltip
        arrow
        open={open}
        disableHoverListener
        title={cell.value}
        onClose={handleTooltipClose}
      >
        <TableCell
          {...cell.getCellProps()}
          onClick={handleTooltipOpen}
          style={tCellStyle}
        >
          {cell.render('Cell')}
        </TableCell>
      </HtmlTooltip>
    </ClickAwayListener>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  checkboxes: {
    display: 'flex',
  },
  checkbox: {
    display: 'flex',
    margin: '0px',
  },
  checkboxLabel: {
    display: 'flex',
  },
}));
