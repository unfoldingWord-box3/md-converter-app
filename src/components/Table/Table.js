import React from 'react';
import { useTable } from 'react-table';
import { makeStyles } from '@material-ui/core/styles';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

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

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, classes, ...rest }, ref) => {
    const defaultRef = React.useRef()
    const resolvedRef = ref || defaultRef

    React.useEffect(() => {
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
    hiddenColumns: ['ID', 'SupportReference', 'OrigQuote', 'Occurrence'],
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
          {headerGroups.map((headerGroup) => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <TableCell {...column.getHeaderProps()}>
                  {column.render('Header')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <TableCell {...cell.getCellProps()} style={{ color: 'grey' }}>
                      {cell.render('Cell')}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </MaUTable>
      {sourceNoteVersion && <h4>{sourceNoteVersion}</h4>}
    </div>
  );
}

export default Table;
