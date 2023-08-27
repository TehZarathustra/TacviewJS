import React, {useState} from 'react'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Badge from '@mui/material/Badge';
import LocalShipping from '@mui/icons-material/LocalShipping';
import Flight from '@mui/icons-material/Flight';

export const KillCounter = ({type, kills, count, text, onChange}) => {
	const [killCount, setKillCount] = useState(count || 0);
	const [killText, setKillText] = useState(text || '')

	const IconSx = {
		color: 'action.active',
		mr: 1,
		my: 0.5
	};

	const onCountChange = countType => {
		const [setCount] = onChange;
		const updatedCount = countType === 'reduce'
		 ? Math.max(killCount - 1, 0)
		 : killCount + 1;

		setKillCount(updatedCount);
		setCount(updatedCount);
	};

	const onTextChange = e => {
		const [_, setText] = onChange;
		const value = e.target.value;
		setKillText(value);
		setText(value);
	};

	return (
		<div>
			<Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
				<Badge color="primary" badgeContent={killCount} anchorOrigin={{vertical: 'top', horizontal: 'left'}}>
					{type === 'aa'
						? <Flight sx={IconSx} />
						: <LocalShipping sx={IconSx} />}
				</Badge>
				<TextField
					label={type.split('').join('/')}
					variant="standard"
					fullWidth
					onChange={onTextChange}
					value={killText}
				/>
			</Box>
			<Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
				<ButtonGroup variant="text">
					<Button
						size='small'
						aria-label="reduce"
						onClick={() => onCountChange('reduce')}
					>
						<RemoveIcon fontSize="small" />
					</Button>
					<Button
						size='small'
						aria-label="increase"
						onClick={() => onCountChange('increase')}
					>
						<AddIcon fontSize="small" />
					</Button>
				</ButtonGroup>
			</Box>
		</div>
	);
}
