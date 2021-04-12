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
  p: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  }
}));

export default function LoadingIndicator({
  size,
  color,
  message,
  secondaryMessage,
}) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Loader type="ThreeDots" color={color} height={size} width={size} />
      <h1 style={{ color }}>
        {`${message} ${secondaryMessage || ''}`}
      </h1>
    </div>
  );
}

LoadingIndicator.defaultProps = {
  size: 300,
  color: '#2B374B',
  message: 'Loading ...',
};

LoadingIndicator.propTypes = {
  size: PropsTypes.number,
  message: PropsTypes.string,
  secondaryMessage: PropsTypes.string,
};
