'use client';

import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Valuation, ResourceType } from '../lib/bountyData';

interface ValuationFormProps {
  valuation: Valuation;
  onValuationChange: (newValuation: Valuation) => void;
}

const resourceTypes: ResourceType[] = ['Gold', 'Dust', 'Stones', 'Diamonds', 'Juice', 'Shards'];

const ValuationForm: React.FC<ValuationFormProps> = ({ valuation, onValuationChange }) => {

  const handlePerUnitChange = (type: ResourceType, value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      const newPerUnit = { ...valuation.perUnit, [type]: numericValue };
      onValuationChange({ ...valuation, perUnit: newPerUnit });
    } else if (value === '' || value === '-') {
        const newPerUnit = { ...valuation.perUnit, [type]: 0 };
        onValuationChange({ ...valuation, perUnit: newPerUnit });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Resource Valuation (per Unit)</Typography>
      <Box 
        component="form"
        sx={{ 
          display: 'flex', 
          flexDirection: 'row', 
          flexWrap: 'nowrap',
          gap: 2,
        }}
      >
        {resourceTypes.map((type) => (
          <TextField
            key={type}
            label={type}
            type="number"
            value={valuation.perUnit[type]?.toString() ?? ''}
            onChange={(e) => handlePerUnitChange(type, e.target.value)}
            size="small"
            variant="outlined"
            inputProps={{ step: "any" }}
            sx={{ 
              flexGrow: 1,
              flexShrink: 1,
              minWidth: 80,
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default ValuationForm;
