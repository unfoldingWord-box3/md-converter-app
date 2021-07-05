import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Step,
  Paper,
  Button,
  Stepper,
  Divider,
  StepButton,
  Typography,
} from '@material-ui/core';
import {
  RepositoryContext,
  AuthenticationContext,
} from 'gitea-react-toolkit';
import BooksList from '../BooksList';
import useFetch from '../../hooks/useFetch';
import LoadingIndicator from '../LoadingIndicator';
import { getActiveStep } from '../../helpers/getActiveStep';
import getSupportedResourceId from '../../helpers/getSupportedResourceId';
import { TsvDataContext } from '../../state/contexts/TsvDataContextProvider'
import BackdropLoadingIndicator from '../BackdropLoadingIndicator'

function AppStepper() {
  const classes = useStyles();
  const { state: authentication, component: authenticationComponent } = useContext(AuthenticationContext);
  const { state: sourceRepository, component: repositoryComponent } = useContext(RepositoryContext);
  const { isLoading: isFetching } = useContext(TsvDataContext);
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({
    0: !!authentication,
    1: !!sourceRepository,
  });

  const { tree_url } = sourceRepository || {};
  const { data, isLoading, isError } = useFetch(tree_url, 'repo-data');

  useEffect(() => {
    setCompleted({
      0: !!authentication,
      1: !!sourceRepository,
    });
  }, [authentication, sourceRepository]);

  useEffect(() => {
    const newActiveStep = getActiveStep(completed);
    setActiveStep(newActiveStep);
  }, [completed, setActiveStep]);

  const steps = [
    {
      label: 'Login',
      instructions: 'Login to Door43',
      component: () => (authenticationComponent),
    },
    {
      label: 'Repository',
      instructions: 'Select a markdown resource (e.g., tn, tq) to Convert to TSV',
      component: () => (repositoryComponent),
    },
    {
      label: 'Book',
      instructions: 'Select a book to start a project',
      component: () => (
        <BooksList files={data?.tree} resourceId={getSupportedResourceId(sourceRepository)} />
      ),
    },
  ];

  const handleNext = () => {
    let newActiveStep;
    const totalSteps = steps.length;
    const isLastStep = activeStep === totalSteps - 1;
    const completedSteps = Object.keys(completed).length;
    const allStepsCompleted = completedSteps === totalSteps;

    if (isLastStep && !allStepsCompleted) {
      // Last step but not all steps completed, thus
      // find the first step that has been completed
      newActiveStep = steps.findIndex((step, i) => !(i in completed));
    } else {
      newActiveStep = parseInt(activeStep) + 1;
    }
    setActiveStep(newActiveStep);
  };

  const handleBack = () => setActiveStep(activeStep - 1);
  const handleStep = step => () => setActiveStep(step);

  if (steps[activeStep]) {
    return (
      <Paper style={{ alignSelf: 'center', width: '100%' }}>
        <BackdropLoadingIndicator loading={isFetching} size={80} />
        <div className={classes.root}>
          <Stepper activeStep={activeStep}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepButton onClick={handleStep(index)} completed={completed[index]} disabled={isFetching}>
                  {step.label}
                </StepButton>
              </Step>
            ))}
          </Stepper>
          <div>
            <div className={classes.step}>
              <Typography variant="h5" className={classes.instructions}>
                Step {activeStep + 1}: {steps[activeStep].instructions}
              </Typography>
              <Divider className={classes.divider} />
              {
                isError ? <h1>Something went wrong ...</h1> :
                isLoading ? <LoadingIndicator/> :
                steps[activeStep].component()
              }
              <Divider className={classes.divider} />
              <div className={classes.buttons}>
                <Button disabled={activeStep === 0 || isFetching} onClick={handleBack} className={classes.button}>
                  Back
                </Button>
                <Button
                  data-test="stepper-next"
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  className={classes.button}
                  disabled={!completed[activeStep] || activeStep === steps.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Paper>
    );
  } else {
    return <div />;
  }
}

const useStyles = makeStyles(theme => ({
  root: { padding: `${theme.spacing(2)}px` },
  step: {
    maxWidth: '790px',
    margin: 'auto',
    padding: `0 ${theme.spacing(2)}px`,
  },
  divider: { margin: `${theme.spacing(2)}px 0` },
  buttons: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  button: { marginRight: theme.spacing(1) },
  completed: { display: 'inline-block' },
  instructions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

export default AppStepper;
