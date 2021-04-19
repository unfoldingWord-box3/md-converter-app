import React, { useState, useEffect, useMemo, useRef, forwardRef } from 'react';
import { useTable } from 'react-table';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

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

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 200,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

const IndeterminateCheckbox = forwardRef(
  ({ indeterminate, classes, ...rest }, ref) => {
    const defaultRef = useRef()
    const resolvedRef = ref || defaultRef

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return <input type="checkbox" ref={resolvedRef} {...rest} />
  }
)

function Table({
  data,
  columns,
  sourceNoteVersion,
}) {
  const classes = useStyles();
  const initialState = {
    hiddenColumns: ['ID', 'SupportReference', 'OrigQuote', 'Occurrence', 'Quote', 'Tags'],
  }
  // Use the state and functions returned from useTable to build your UI
  const {
    rows,
    prepareRow,
    allColumns,
    headerGroups,
    getTableProps,
    getToggleHideAllColumnsProps,
  } = useTable({
    data,
    columns,
    initialState,
  });


  const Checkboxes = useMemo(() => {
    return allColumns.map(column => {
      return (
        <div key={column.id} className={classes.checkbox}>
          <label className={classes.checkboxLabel}>
            <input type="checkbox" {...column.getToggleHiddenProps()} />{' '}
            {column.id}
          </label>
        </div>
    )})
  }, [allColumns, classes])

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
    return rows.map((row, i) => {
      prepareRow(row);
      return (
        <TableRow {...row.getRowProps()}>
          {row.cells.map((cell, key) => <Record key={key} cell={cell} />)}
        </TableRow>
      );
    })
  }, [rows, prepareRow])

  // Render the UI for your table
  return (
    <div className={classes.root}>
      <div className={classes.checkboxes}>
        <div className={classes.checkbox}>
          <IndeterminateCheckbox {...getToggleHideAllColumnsProps()} classes={classes} />
          All
        </div>
        {Checkboxes}
      </div>
      <MaUTable {...getTableProps()}>
        <TableHead>
          {Headers}
        </TableHead>
        <TableBody>
          {TableRows}
        </TableBody>
      </MaUTable>
      {sourceNoteVersion && <h4>{sourceNoteVersion}</h4>}
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
export default Table;
