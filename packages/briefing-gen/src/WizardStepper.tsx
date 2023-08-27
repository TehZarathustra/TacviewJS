import React, {useState} from 'react'
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export const WizardStepper = ({activeStep, steps}) => {
	return (
		<div style={{boxSizing: 'border-box', padding: '20px', maxHeight: '90vh', overflowY: 'scroll'}}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
            	sx={{overflow: 'hidden'}}
              optional={
              	<Typography
              		variant="caption"
              		sx={{display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', width: '80%'}}
              	>
              		{(Boolean(step.title) && step.title.split('_').join(' ')) || step.aircraft}
              	</Typography>
              }
            >
              {step.label}
            </StepLabel>
            <StepContent sx={{overflowY: 'scroll', overflowX: 'hidden', maxHeight: 600}}>
              {step.description && <Typography>{step.description}</Typography>}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </div>
	);
}
