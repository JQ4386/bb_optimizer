'use client';

import React from 'react';
import { Box, Button, Switch, FormControlLabel, Typography, Paper, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockIcon from '@mui/icons-material/Lock'; // Keep for potential future use, but toggle replaces button
import CalculateIcon from '@mui/icons-material/Calculate';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DownloadIcon from '@mui/icons-material/Download';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { LineChart } from '@mui/x-charts/LineChart';

// Add HistoryPoint interface (can also be imported if defined centrally)
interface HistoryPoint {
    step: number;
    expectedValue: number; 
    currentValue: number; 
}

interface ControlsProps {
  onEvaluate: () => void;
  onReset: () => void;
  onRefresh: () => void; // Added prop for Refresh button
  onSubscriptionToggle: () => void;
  hasSub: boolean;
  evaluationResult?: { 
    recommendedAction?: 'Stop' | 'Refresh';
    expectedNetGain: number;
    diamondCost: number;
  } | null;
  evaluationHistory: HistoryPoint[]; // Add history prop
  // Disable evaluate/refresh/autolock if needed (e.g., during computation)
  // disabled?: boolean; 
  // Add new props
  isBountifulBountyEnabled: boolean;
  onBountifulBountyToggle: () => void;
  totalExtraValue: number;
}

const Controls: React.FC<ControlsProps> = ({ 
  onEvaluate, 
  onReset, 
  onRefresh, // Destructure new prop
  onSubscriptionToggle,
  hasSub,
  evaluationResult,
  evaluationHistory, // Destructure history prop
  // Destructure new props
  isBountifulBountyEnabled,
  onBountifulBountyToggle,
  totalExtraValue,
  // disabled = false,
}) => {
  // Define gap value for consistent spacing calculation
  const gapValue = 24; // Corresponds to theme.spacing(3)

  // Map history data to plain objects for the chart dataset
  const chartDataset = evaluationHistory.map(point => ({
    step: point.step,
    expectedValue: point.expectedValue,
    currentValue: point.currentValue
  }));

  const handleExport = () => { // No longer needs async
    if (chartDataset.length === 0) {
      console.error("No data to export.");
      return;
    }

    const canvasWidth = 800; 
    const canvasHeight = 450; // Increased height for title/text
    const padding = 50; // Padding around the chart area
    const titleHeight = 30;
    const bottomTextHeight = 30;
    const chartHeight = canvasHeight - padding * 2 - titleHeight - bottomTextHeight;
    const chartWidth = canvasWidth - padding * 2;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }

    // --- Drawing Logic --- 

    // 1. Background
    ctx.fillStyle = '#ffffff'; // White background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Title
    ctx.fillStyle = '#333'; // Dark text
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Refresh Value Trend', canvasWidth / 2, padding); // Draw title near top

    // 3. Determine Data Range
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    chartDataset.forEach(p => {
      minX = Math.min(minX, p.step);
      maxX = Math.max(maxX, p.step);
      minY = Math.min(minY, p.expectedValue, p.currentValue);
      maxY = Math.max(maxY, p.expectedValue, p.currentValue);
    });
    
    // Add some buffer to Y range if min/max are too close or zero
    if (maxY === minY) {
        maxY += 10; 
        minY = Math.max(0, minY - 10); // Ensure minY is not negative unless data is
    } else {
        const range = maxY - minY;
        maxY += range * 0.1; // Add 10% padding top
        minY = Math.max(0, minY - range * 0.1); // Add 10% padding bottom (but not below 0)
    }
    // Ensure X range has some width if only one data point
    if (maxX === minX) {
        maxX += 1;
    }

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;

    // Helper to map data point to canvas coordinates
    const mapToCanvas = (point: { step: number, value: number }) => {
      const x = padding + ((point.step - minX) / rangeX) * chartWidth;
      // Y is inverted because canvas origin (0,0) is top-left
      const y = padding + titleHeight + chartHeight - ((point.value - minY) / rangeY) * chartHeight;
      return { x, y };
    };

    // 4. Draw Axes
    ctx.strokeStyle = '#ccc'; // Light grey for axes
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Y Axis
    ctx.moveTo(padding, padding + titleHeight);
    ctx.lineTo(padding, padding + titleHeight + chartHeight);
    // X Axis
    ctx.moveTo(padding, padding + titleHeight + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + titleHeight + chartHeight);
    ctx.stroke();

    // Draw Axis Labels/Ticks (Simplified)
    ctx.fillStyle = '#666'; // Medium grey text
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(maxX.toString(), padding + chartWidth, padding + titleHeight + chartHeight + 5);
    ctx.fillText(minX.toString(), padding, padding + titleHeight + chartHeight + 5);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(maxY.toFixed(0), padding - 5, padding + titleHeight);
    ctx.fillText(minY.toFixed(0), padding - 5, padding + titleHeight + chartHeight);

    // 5. Draw Data Lines
    const drawLine = (dataKey: 'expectedValue' | 'currentValue', color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      chartDataset.forEach((point, index) => {
        const canvasPoint = mapToCanvas({ step: point.step, value: point[dataKey] });
        if (index === 0) {
          ctx.moveTo(canvasPoint.x, canvasPoint.y);
        } else {
          ctx.lineTo(canvasPoint.x, canvasPoint.y);
        }
      });
      ctx.stroke();
    };

    drawLine('expectedValue', '#9c27b0'); // Purple
    drawLine('currentValue', '#2e7d32'); // Green

    // 6. Draw Legend (Simple)
    const legendX = padding + chartWidth - 150;
    const legendY = padding + titleHeight + 10;
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.fillStyle = '#9c27b0'; // Purple
    ctx.fillRect(legendX, legendY, 15, 10);
    ctx.fillStyle = '#333';
    ctx.fillText('Expected (Post-Refresh)', legendX + 20, legendY);

    ctx.fillStyle = '#2e7d32'; // Green
    ctx.fillRect(legendX, legendY + 15, 15, 10);
    ctx.fillStyle = '#333';
    ctx.fillText('Actual (Pre-Refresh)', legendX + 20, legendY + 15);

    // 7. Draw Bottom Text
    ctx.fillStyle = '#555'; // Text color
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const bottomText = `Total Extra Value (Since Reset): ${totalExtraValue.toFixed(2)}`;
    ctx.fillText(bottomText, canvasWidth / 2, canvasHeight - padding / 2);

    // --- Export Logic --- 
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = 'bounty-chart-export.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    // Single Paper containing everything
    <Paper elevation={3} sx={{ p: 2, mt: 2, mb: 2 }}>
      {/* Use Flexbox for side-by-side layout */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: `${gapValue}px` }}> 

        {/* Left Column: Controls Area (Flex Item) - Wider */}
        {/* Adjust flexBasis for 8/12 split, subtracting half the gap */}
        <Box sx={{ flexBasis: { xs: '100%', md: `calc(100% * 8 / 12 - ${gapValue / 2}px)`}, flexGrow: 1 }}> 
          {/* Group buttons and toggles */}
          <Box mb={2}>
            {/* Top row: Main Actions */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
              {/* Left side buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={onEvaluate} 
                  sx={{ whiteSpace: 'nowrap' }}
                  startIcon={<AutoAwesomeIcon />}
                >
                  Compute Optimal
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={onRefresh} 
                  startIcon={<RefreshIcon />} 
                  title="Refresh Unlocked Slots (Cost: 50 Diamonds)"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Refresh
                </Button>
              </Box>
              
              {/* Right side toggles/reset + Export */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={<Switch checked={hasSub} onChange={onSubscriptionToggle} />}
                  label={hasSub ? "Sub (9 Slots)" : "No Sub (8 Slots)"}
                  title="Toggle between 8 and 9 quest slots"
                  sx={{ mr: { sm: 1 }, whiteSpace: 'nowrap' }}
                />
                <FormControlLabel
                  control={<Switch checked={isBountifulBountyEnabled} onChange={onBountifulBountyToggle} />}
                  label="Bountiful (+100%)"
                  title="Apply Bountiful Bounty bonus (Doubles Quantities)"
                  sx={{ whiteSpace: 'nowrap' }} 
                />
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={onReset} 
                  size="small" 
                  sx={{ whiteSpace: 'nowrap' }}
                  startIcon={<RestartAltIcon />}
                >
                  Reset Board
                </Button>
              </Box>
            </Box>
          </Box>
          
          {/* Result display area */}
          <Box sx={{ p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1, minHeight: '6em', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {evaluationResult ? (
              <>
                <Typography variant="body2">
                  Expected Net Gain from Refresh Action: {evaluationResult.expectedNetGain.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  Diamond Cost (Value): {evaluationResult.diamondCost.toFixed(2)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color={(evaluationResult.recommendedAction === 'Refresh' && evaluationResult.expectedNetGain > 0) ? 'success.main' : 'error.main'} 
                  sx={{ fontWeight: 'bold' }}
                >
                  Recommendation: {(evaluationResult.recommendedAction === 'Refresh' && evaluationResult.expectedNetGain > 0) 
                                    ? 'Refresh Recommended' 
                                    : 'Do Not Refresh (Stop)'}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                Click "Compute Optimal" to see recommendations.
              </Typography>
            )}
          </Box>
           {/* Display Total Extra Value */}
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>
                Total Extra Value (Since Reset): {totalExtraValue.toFixed(2)}
            </Typography>
        </Box>

        {/* Right Column: Chart Placeholder Area (Flex Item) - Narrower */} 
        {/* Adjust flexBasis for 4/12 split, subtracting half the gap */}
        <Box sx={{ 
            position: 'relative', // Needed for absolute positioning of children
            flexBasis: { xs: '100%', md: `calc(100% * 4 / 12 - ${gapValue / 2}px)`},
            display: 'flex', 
            flexDirection: 'column', 
            flexGrow: 1, 
            minHeight: 250 
        }}> 
          {/* Export Button Overlay */} 
           <IconButton 
              aria-label="Export Chart"
              onClick={handleExport}
              disabled={chartDataset.length === 0}
              size="small"
              sx={{
                  position: 'absolute',
                  top: 8, // Adjust as needed
                  right: 8, // Adjust as needed
                  zIndex: 1 // Ensure it's above chart elements if necessary
              }}
              title="Export Chart as PNG"
            >
              <DownloadIcon fontSize="small" />
            </IconButton>

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', flexShrink: 0, pr: 5 /* Add padding to avoid overlap */ }}>
            Refresh Value Trend
          </Typography>
          {/* Actual Line Chart */}
          <Box sx={{ flexGrow: 1, width: '100%', height: '100%' }}>
            {chartDataset.length > 0 ? (
              <LineChart
                dataset={chartDataset}
                xAxis={[{ 
                    dataKey: 'step', 
                    label: 'Step', 
                    scaleType: 'linear',
                    valueFormatter: (value: number) => value.toString()
                }]}
                series={[
                  {
                    dataKey: 'expectedValue',
                    label: 'Expected (Post-Refresh)',
                    color: '#9c27b0', // Purple
                    valueFormatter: (value: number | null) => value?.toFixed(0) ?? '' // Format as integer
                  },
                  {
                    dataKey: 'currentValue',
                    label: 'Actual (Pre-Refresh)',
                    color: '#2e7d32', // Green
                    valueFormatter: (value: number | null) => value?.toFixed(0) ?? '' // Format as integer
                  },
                ]}
                margin={{ top: 10, right: 10, bottom: 20, left: 40 }} // Adjusted left margin for values
                // Optionally add grid, tooltip, legend customization here
              />
            ) : (
               <Box 
                    sx={{ 
                    border: '1px dashed', 
                    borderColor: 'divider', 
                    borderRadius: 1, 
                    bgcolor: 'action.hover',
                    flexGrow: 1, 
                    minHeight: 150, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                    }} 
                >
                    <Typography variant="caption" color="text.secondary">No evaluation data yet.</Typography>
                </Box>
            )}
          </Box>
        </Box>

      </Box>
    </Paper>
  );
};

export default Controls;
