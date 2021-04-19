import React, { useState, useContext, useCallback, useRef } from 'react';
import { useTable } from 'react-table';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import ProjectFab from '../ProjectFab';
import { TsvDataContext } from '../../state/contexts/TsvDataContextProvider';
import useDeepCompareEffect from 'use-deep-compare-effect'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flex: 'auto',
    flexDirection: 'column',
  },
  flex: {
    display: 'flex',
  },
  fill: {
    display: 'flex',
    justifyContent: 'center',
    fontWeight: 'bold',
    height: '19px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    padding: '0px',
  },
  button: {
    width: '240px',
    margin: '15px 5px',
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

const DraggableTable = ({
  data,
  bookId,
  columns,
  subject,
  saveBackup,
  languageId,
  savedBackup,
  exportProject,
  setSavedBackup,
  toggleRecordView,
}) => {
  const classes = useStyles();
  // Made a local state for records to help improve UI performance.
  const [records, setRecords] = useState(data);
  const [dropped, setDropped] = useState(false)
  const { saveProjectChanges } = useContext(TsvDataContext);

  // This useEffect is necessary so that we keep the local records state in sync with its version in TsvDataContext
  useDeepCompareEffect(() => {
    setRecords(data)
  }, [data])

  useDeepCompareEffect(() => {
    // Only save target notes changes to TsvDataContext when finished dragging item.
    if (dropped) {
      console.log('dropped saveProjectChanges')
      saveProjectChanges(records);
      setDropped(false);
    }
  }, [dropped, records])

  const getRowId = useCallback((row) => {
    const reference = row.Reference ? `${row.Reference}` : `${row.Chapter}-${row.Verse}`
    return `${row.id}-${reference}`
  }, [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    data: records,
    columns,
    getRowId,
  });

  const moveRow = (dragIndex, hoverIndex) => {
    setDropped(false)
    const dragRecord = records[dragIndex];
    setRecords(
      update(records, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragRecord]
        ]
      })
    );
    setSavedBackup(false);
  }

  const onDropped = () => {
    setDropped(true)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={classes.root}>
        <div className={classes.fill}>{`Target ${subject} (${languageId}_${bookId})`}</div>
        <ProjectFab
          records={records}
          saveBackup={saveBackup}
          savedBackup={savedBackup}
          exportProject={exportProject}
        />
        <MaUTable {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => {
                  const tCellStyle = {};
                  if (column.Header === "GLQuote") tCellStyle.minWidth = '160px';
                  if (column.Header === "Chapter" || column.Header === "Verse" || column.Header === "Reference" || column.Header === "Included") {
                    tCellStyle.width = '10px';
                    tCellStyle.padding = '12px 4px';
                  }

                  return (
                    <TableCell {...column.getHeaderProps()} style={tCellStyle}>
                      {column.render('Header')}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {rows.map(
              (row, index) =>
                prepareRow(row) || (
                  <Row
                    key={`${index}-${row.id}`}
                    row={row}
                    index={index}
                    moveRow={moveRow}
                    onDropped={onDropped}
                    {...row.getRowProps()}
                    toggleRecordView={toggleRecordView}
                  />
                )
            )}
          </TableBody>
        </MaUTable>
      </div>
    </DndProvider>
  );
};

const DND_ITEM_TYPE = 'row';

const Row = ({ row, index, moveRow, toggleRecordView, onDropped }) => {
  const dropRef = useRef(null);
  const dragRef = useRef(null);

  const [, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    hover(item, monitor) {
      if (!dropRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveRow(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    }
  });

  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: DND_ITEM_TYPE, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (_, monitor) => {
      if (monitor.didDrop()) {
        onDropped()
      }
    },
  });

  const opacity = isDragging ? 0 : 1;
  const cursor = isDragging ? 'grabbing' : 'grab';

  preview(drop(dropRef));
  drag(dragRef);

  return (
    <TableRow
      ref={dropRef}
      style={{ opacity }}
    >
      {row.cells.map((cell, key) => <Record key={key} cell={cell} index={index} toggleRecordView={toggleRecordView}/>)}
      <TableCell ref={dragRef} style={{ maxWidth: '50px', padding: '5px', cursor }} title="Drag">
        <DragIndicatorIcon />
      </TableCell>
    </TableRow>
  );
};

const Record = ({
  cell,
  index,
  toggleRecordView,
}) => {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const columnHeader = cell.column.Header
  const isIncludedCheckbox = columnHeader === 'Included'
  const tcStyle = { borderLeft: '1px solid rgba(224, 224, 224, 1)' }

  if ((columnHeader === "Question" || columnHeader === "Response") && cell?.row?.values?.Included === false) {
    tcStyle.textDecoration = 'line-through';
    tcStyle.backgroundColor = 'rgba(0, 0, 0, 0.04)';
  }

  if (isIncludedCheckbox) tcStyle.textAlign = 'center'

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <HtmlTooltip
        arrow
        title={cell.value}
        disableHoverListener
        onClose={handleTooltipClose}
        open={isIncludedCheckbox ? false : open}
      >
        <TableCell
          {...cell.getCellProps()}
          onClick={handleTooltipOpen}
          style={tcStyle}
        >
          {isIncludedCheckbox ?
            <Checkbox
              name="Included"
              color="primary"
              checked={cell.value}
              style={{ padding: '0px' }}
              onChange={(e) => toggleRecordView(e, index)}
            />
            :
            cell.render('Cell')
          }
        </TableCell>
      </HtmlTooltip>
    </ClickAwayListener>
  );
}

export default DraggableTable;
