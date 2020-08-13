import React from 'react';
import PropsTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme) => ({
  root: {},
}));

export default function LoadingIndicator({
  size,
  message,
}) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CircularProgress size={size} />
      <h1>{message}</h1>
    </div>
  );
}

LoadingIndicator.defaultProps = {
  size: 300,
  message: 'Loading ...',
};

LoadingIndicator.propTypes = {
  size: PropsTypes.number.isRequired,
  files: PropsTypes.array.isRequired,
  message: PropsTypes.string.isRequired,
  onItemClick: PropsTypes.func.isRequired,
};
