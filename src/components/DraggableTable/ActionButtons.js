import React from 'react';
import Button from '@material-ui/core/Button';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import GetAppIcon from '@material-ui/icons/GetApp';
import CheckBoxRoundedIcon from '@material-ui/icons/CheckBoxRounded';

const ActionsButtons = ({
  records,
  classes,
  saveBackup,
  savedBackup,
  exportProject,
}) => (
  <div className={classes.buttons}>
    <Button
      size="medium"
      color="primary"
      variant="outlined"
      startIcon={savedBackup ? <CheckBoxRoundedIcon htmlColor='green'/> : <GetAppIcon />}
      className={classes.button}
      onClick={saveBackup}
    >
      SAVE BACKUP
    </Button>
    <Button
      size="medium"
      color="primary"
      variant="contained"
      startIcon={<SaveAltIcon />}
      className={classes.button}
      onClick={() => exportProject(records)}
    >
      EXPORT TO TSV
    </Button>
  </div>
);

export default ActionsButtons;

