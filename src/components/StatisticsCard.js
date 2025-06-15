import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  minWidth: 200,
  margin: theme.spacing(1),
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const StatisticsCard = ({ title, value, icon, color }) => {
  return (
    <StyledCard>
      <CardContent>
        {icon && React.cloneElement(icon, { style: { fontSize: 40, color } })}
        <Typography variant="h5" component="div">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </StyledCard>
  );
};

export default StatisticsCard;