import React from 'react';
import PropsTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Loader from 'react-loader-spinner';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '30px',
    padding: '30px',
  },
  message: {
    color: theme.palette.primary.main,
  },
  p: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  }
}));

export default function LoadingIndicator({
  size,
  message,
  secondaryMessage,
}) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Loader type="ThreeDots" color="#2B374B" height={size} width={size} />
      <h1 className={classes.message}>{`${message} ${secondaryMessage || ''}`}</h1>
    </div>
  );
}

LoadingIndicator.defaultProps = {
  size: 300,
  message: 'Loading ...',
};

LoadingIndicator.propTypes = {
  size: PropsTypes.number,
  message: PropsTypes.string,
  secondaryMessage: PropsTypes.string,
};
