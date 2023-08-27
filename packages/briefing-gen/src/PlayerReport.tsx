import React, {useState} from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import {KillCounter} from './KillCounter';
import {Rating} from './Rating';

export const PlayerReport = ({data, onNext, onPrev, isLast}) => {
	const [pilot, setPilot] = useState(data?.template?.pilot || data?.name || '');
	const [aircraft, setAircraft] = useState(data?.template?.aircraft || data?.aircraft || '');
	const [status, setStatus] = useState(data?.template?.status || (data?.isAlive ? 'survived' : 'killed'));
	const [reason, setReason] = useState(data?.template?.reason || data?.reason || '');
	const [remarks, setRemarks] = useState(data?.template?.remarks || data?.remarks || '');
	const [pattern, setPattern] = useState(data?.template?.pattern || '');
	const [landing, setLanding] = useState(data?.template?.landing || '');
	const [aaCount, setAaCount] = useState(data?.template?.aaCount || data?.aa?.length || '');
	const [aaText, setAaText] = useState(data?.template?.aaText || data?.aa?.join(', ') || '');
	const [agCount, setAgCount] = useState(data?.template?.agCount || data?.ag?.length || '');
	const [agText, setAgText] = useState(data?.template?.agText || data?.ag?.join(', ') || '');
	const [flightTime, setFlightTime] = useState(data?.template?.flightTime || data?.flightTime || '');

	const setKills = type => {
		const setters = {
			aa: [
				setAaCount,
				setAaText,
			],
			ag: [
				setAgCount,
				setAaText,
			]
		};

		return setters[type];
	}

	const marginSx = {margin: '15px 0'};

	const onSubmit = () => {
		onNext({
			...data,
			template: {
				pilot,
				aircraft,
				status,
				reason,
				remarks,
				pattern,
				landing,
				aaCount,
				aaText,
				agCount,
				agText,
				flightTime,
			}
		});
	}

	const onSubmitPrev = () => {
		onPrev({
			...data,
			template: {
				pilot,
				aircraft,
				status,
				reason,
				remarks,
				pattern,
				landing,
				aaCount,
				aaText,
				agCount,
				agText,
				flightTime,
			}
		});
	}

	return (
		<div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
			<DialogTitle sx={{paddingTop: 0, opacity: '.6'}}>
				<div>Pilot report: {pilot}</div>
				<Chip label={data.flight} size="small" color="primary" variant="outlined" />
				{'\n'}<Chip
					label={(status === 'survived' || data?.isAlive) ? 'survived' : 'died'}
					size="small"
					sx={{border: 'none'}}
					color={(status === 'survived' || data?.isAlive) ? 'success' : 'error'}
					variant="outlined"
				/>
			</DialogTitle>
			<DialogContent sx={{display: 'flex', flexDirection: 'column'}}>
				<DialogContentText>
					Edit auto generated report to fine tune things and rate pattern/landing
				</DialogContentText>
				<TextField
					autoFocus
					id="pilot"
					label="Pilot"
					type="text"
					fullWidth
					variant="standard"
					value={pilot}
					onChange={(e) => setPilot(e.target.value)}
					sx={marginSx}
				/>
				<TextField
					id="Aircraft"
					label="Aircraft"
					type="text"
					fullWidth
					variant="standard"
					value={aircraft}
					onChange={(e) => setAircraft(e.target.value)}
					sx={marginSx}
				/>
				<TextField
					id="Time"
					label="Flight time"
					type="text"
					fullWidth
					variant="standard"
					disabled
					value={Math.floor(flightTime / 60) + ' minutes'}
					sx={marginSx}
				/>
				{data.aa.length > 0 && <KillCounter
					type="aa"
					count={aaCount}
					text={aaText}
					onChange={setKills('aa')}
				/>}
				{data.ag.length > 0 && <KillCounter
					type="ag"
					count={agCount}
					text={agText}
					onChange={setKills('ag')}
				/>}
				<FormControl variant="standard" sx={{minWidth: '100%' }}>
					<InputLabel id="demo-simple-select-standard-label">Status</InputLabel>
					<Select
						labelId="demo-simple-select-standard-label"
						id="demo-simple-select-standard"
						label="Status"
						value={status}
						sx={marginSx}
						onChange={(e) => setStatus(e.target.value)}
					>
						<MenuItem value="survived">Survived</MenuItem>
						<MenuItem value="crashed">Crashed</MenuItem>
						<MenuItem value="ejected">Ejected</MenuItem>
						<MenuItem value="killed">Killed</MenuItem>
					</Select>
				</FormControl>
				{status !== 'survived' && <TextField
					autoFocus
					id="pilot"
					label="PILOT DIED. Write down the circumstances of death..."
					type="text"
					sx={marginSx}
					fullWidth
					variant="standard"
					onChange={(e) => setReason(e.target.value)}
					value={reason}
				/>}
				{status === 'survived' && <div style={{display: 'flex', gap: '20px'}}>
					<Rating value={pattern} onChange={setPattern} title="pattern" />
					<Rating value={landing} onChange={setLanding} title="landing" />
				</div>}
				<TextField
					id="outlined-multiline-static"
					label="_ // remarks"
					fullWidth
					multiline
					rows={4}
					sx={marginSx}
					value={remarks}
					onChange={(e) => setRemarks(e.target.value)}
				/>
				<div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: 'auto'}}>
					<Button onClick={onSubmitPrev}>Prev</Button>
					<Button onClick={onSubmit} variant="outlined">
						next
					</Button>
				</div>
			</DialogContent>
		</div>
	);
};
