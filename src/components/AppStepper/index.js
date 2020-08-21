import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Stepper,
  Step,
  StepButton,
  Button,
  Typography,
  Paper,
  Divider,
} from '@material-ui/core';
import {
  RepositoryContext,
  AuthenticationContext,
} from 'gitea-react-toolkit';
import BooksList from '../BooksList';
import useFetch from '../../hooks/useFetch';
import LoadingIndicator from '../LoadingIndicator';
import { getActiveStep } from '../../helpers/getActiveStep';

function AppStepper() {
  const classes = useStyles();
  const { state: authentication, component: authenticationComponent } = useContext(AuthenticationContext);
  const { state: sourceRepository, component: repositoryComponent } = useContext(RepositoryContext);
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = useState({
    0: !!authentication,
    1: !!sourceRepository,
  });
  const { tree_url } = sourceRepository || {};
  const { data, isLoading, isError } = useFetch(tree_url);

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
      instructions: 'Select a Repository to Convert to TSV',
      component: () => (repositoryComponent),
    },
    {
      label: 'Book',
      instructions: 'Select a Book',
      component: () => (
        <BooksList files={data?.tree} />
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

  const netlifyBadge = (
    <div className={classes.netlifyBadge}>
      <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">
        <img
          src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg"
          alt="Deploys by Netlify"
        />
      </a>
    </div>
  );

  if (steps[activeStep]) {
    return (
      <>
        <Paper>
          <div className={classes.root}>
            <Stepper activeStep={activeStep}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepButton onClick={handleStep(index)} completed={completed[index]}>
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
                  <Button disabled={activeStep === 0} onClick={handleBack} className={classes.button}>
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
        {netlifyBadge}
      </>
    );
  } else {
    return <div />;
  }
}

const useStyles = makeStyles(theme => ({
  root: { padding: `${theme.spacing(2)}px` },
  step: {
    maxWidth: '600px',
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
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  netlifyBadge: {
    width: '100%',
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
}));

export default AppStepper;
