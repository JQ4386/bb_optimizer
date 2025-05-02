'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    TextField,
    Typography,
    Chip,
    IconButton,
    RadioGroup,
    FormControlLabel,
    Radio,
    Stack,
    Grid,
    Paper,
    MenuItem
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ResourceType } from '../lib/bountyData';

// Define resourceTypes LOCALLY
const resourceTypes: ResourceType[] = ['Gold', 'Dust', 'Stones', 'Diamonds', 'Juice', 'Shards'];

// Define resourceIconPaths LOCALLY
const resourceIconPaths: Record<ResourceType, string> = {
  Gold: '/icons/gold.png',
  Dust: '/icons/dust.png',
  Stones: '/icons/rareSoulstone.png',
  Diamonds: '/icons/diamond.png',
  Juice: '/icons/juice.png',
  Shards: '/icons/shard.png',
};

interface BountyDefinitionDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (resourceType: ResourceType, rarity: string) => void;
}

const BountyDefinitionDialog: React.FC<BountyDefinitionDialogProps> = ({ open, onClose, onConfirm }) => {
    // Define rarities INSIDE the component
    const rarities = [
        { id: 'L', label: 'Legendary', color: '#ff9800' },
        { id: 'M', label: 'Mythic', color: '#f44336' },
        { id: 'A', label: 'Ascended', color: '#ce93d8' },
    ];

    const [selectedResourceType, setSelectedResourceType] = useState<ResourceType>('Gold');
    const [selectedRarity, setSelectedRarity] = useState<string>('L');

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setSelectedResourceType('Gold');
            setSelectedRarity('L');
        }
    }, [open]);

    const handleConfirm = () => {
        if (selectedResourceType && selectedRarity) {
            onConfirm(selectedResourceType, selectedRarity);
            onClose(); // Close dialog after confirm
        } else {
            console.error("Cannot confirm: Missing resource or rarity selection.");
        }
    };

    const isConfirmDisabled = !selectedResourceType || !selectedRarity;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Redefine Bounty Quest</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3}>
                    {/* Resource Selection */}
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>Resource Type</Typography>
                        <TextField
                            select
                            label="Resource Type"
                            value={selectedResourceType}
                            onChange={(e) => setSelectedResourceType(e.target.value as ResourceType)}
                            fullWidth
                            margin="dense"
                        >
                            {resourceTypes.map((type: ResourceType) => (
                                <MenuItem key={type} value={type}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box 
                                            component="img"
                                            src={resourceIconPaths[type]} 
                                            alt={type}
                                            sx={{ width: 20, height: 20 }}
                                        />
                                        {type}
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    {/* Rarity Selection */}
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>Rarity</Typography>
                        <TextField
                            select
                            label="Rarity"
                            value={selectedRarity}
                            onChange={(e) => setSelectedRarity(e.target.value)}
                            fullWidth
                            margin="dense"
                        >
                            {rarities.map((rarity) => (
                                <MenuItem key={rarity.id} value={rarity.id}>
                                    {rarity.label} ({rarity.id})
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleConfirm} 
                    variant="contained" 
                    disabled={isConfirmDisabled}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BountyDefinitionDialog; 