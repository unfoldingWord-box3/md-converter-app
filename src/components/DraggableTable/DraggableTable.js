import React, {
  useRef,
  useMemo,
  useState,
  useContext,
  useCallback,
} from 'react';
import { useTable, usePagination } from 'react-table';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { makeStyles } from '@material-ui/core/styles';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import MaUTable from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import useDeepCompareEffect from 'use-deep-compare-effect'
import DragIndicatorIcon from '@material-ui/icons/DragIndicator';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { TsvDataContext } from '../../state/contexts/TsvDataContextProvider';
import ProjectFab from '../ProjectFab';
import HtmlTooltip from '../HtmlTooltip';

export default function DraggableTable({
  data,
  bookId,
  columns,
  subject,
  saveBackup,
  languageId,
  savedBackup,
  targetNotes,
  exportProject,
  setSavedBackup,
  toggleRecordView,
  precedingItemsCount,
  pageCount: controlledPageCount,
}) {
  const classes = useStyles();
  // Made a local state version (records) of data to help improve UI performance.
  const [records, setRecords] = useState(data);
  const [dropped, setDropped] = useState(false)
  const [indexes, setIndexes] = useState(null)
  const { saveProjectChanges } = useContext(TsvDataContext);

  // This useDeepCompareEffect is necessary so that we keep the local records state in sync with its version in TsvDataContext
  useDeepCompareEffect(() => {
    setRecords(data)
  }, [data])

  useDeepCompareEffect(() => {
    if (dropped) {
      const { dragIndex, hoverIndex } = indexes || {}
      if (typeof dragIndex == 'number' && typeof hoverIndex == 'number') {
        const precedingCount = precedingItemsCount || 0;
        const dragRecord = targetNotes[precedingCount + dragIndex];
        saveProjectChanges(
          update(targetNotes, {
            $splice: [
              [precedingCount + dragIndex, 1],
              [precedingCount + hoverIndex, 0, dragRecord]
            ]
          })
        );
        // Clear the indexes state so that when a new drag is initiated it is able to maintain the origin dragIndex (first dragIndex only)
        setIndexes(null)
        setDropped(false);
        setSavedBackup(false);
      }
    }
  }, [dropped, targetNotes, precedingItemsCount, indexes])

  const getRowId = useCallback((row) => {
    const reference = row.Reference ? `${row.Reference}` : `${row.Chapter}-${row.Verse}`
    return `${row.id}-${reference}`
  }, [])

  const {
    page,
    prepareRow,
    headerGroups,
    getTableProps,
    getTableBodyProps,
  } = useTable({
    data: records,
    columns,
    getRowId,
    manualPagination: true,
    pageCount: controlledPageCount,
    initialState: {
      pageIndex: 0,
    },
  }, usePagination);

  const moveRow = useCallback((dragIndex, hoverIndex) => {
    // Only store the first dragIndex since it is the current index for the item in the context state (targetNotes)
    if (!indexes) {
      setIndexes({ dragIndex, hoverIndex })
    } else {
      // Keep the dragIndex state unchanged only change the hoverIndex since it is the destination when the item is dropped.
      setIndexes(prevState => ({ ...prevState, hoverIndex }))
    }
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
  }, [records, indexes])

  const onDropped = useCallback(() => {
    setDropped(true)
  }, [])

  const TableRows = useMemo(() => {
    return page.map((row, index) => {
      prepareRow(row);
      return (
        <Row
          key={`${index}-${row.id}`}
          row={row}
          index={index}
          moveRow={moveRow}
          onDropped={onDropped}
          {...row.getRowProps()}
          toggleRecordView={(e) => toggleRecordView(e, precedingItemsCount + index)}
        />
      );
    })
  }, [page, prepareRow, moveRow, onDropped, toggleRecordView, precedingItemsCount])

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={classes.root}>
        <div className={classes.fill}>{`Target ${subject} (${languageId}_${bookId})`}</div>
        <ProjectFab
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
            {TableRows}
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
    end: () => {
      onDropped()
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

  if (
    (columnHeader === "Question" || columnHeader === "Response" ||
    columnHeader === 'GLQuote' || columnHeader === 'OccurrenceNote')
    && cell?.row?.values?.Included === false
  ) {
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
