import React, {useState} from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import moment from 'moment';

export const MissionReport = ({data, onNext}) => {
	const [title, setTitle] = useState(
		(data?.template?.title || data?.title || '').split('_').join(' ')
	);
	const [missiontime, setMissiontime] = useState(
		moment(data?.missiontime).format('LLLL')
	);
	const [duration, setDuration] = useState(Math.floor(data.duration / 60) + ' minutes');
	const [status, setStatus] = useState(data?.template?.status || data?.status || '');
	const [remarks, setRemarks] = useState(data?.template?.remarks || data?.remarks || '');

	const marginSx = {margin: '15px 0'};

	const onSubmit = () => {
		onNext({
			...data,
			template: {
				title,
				editedDuration: duration,
				missiontime,
				status,
				remarks
			}
		});
	}

	return (
		<div>
			<DialogTitle sx={{paddingTop: 0, opacity: '.6'}}>
				Mission file sheet
			</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					id="Title"
					label="Title"
					type="text"
					fullWidth
					variant="standard"
					onChange={(e) => setTitle(e.target.value)}
					value={title}
					sx={marginSx}
				/>
				<TextField
					autoFocus
					id="Status"
					label="Status"
					type="text"
					fullWidth
					variant="standard"
					onChange={(e) => setStatus(e.target.value)}
					value={status}
					sx={marginSx}
				/>
				<TextField
					id="Time"
					label="Time"
					type="text"
					fullWidth
					variant="standard"
					disabled
					value={missiontime}
					sx={marginSx}
				/>
				<TextField
					id="Duration"
					label="Duration"
					type="text"
					fullWidth
					variant="standard"
					disabled
					value={duration}
					sx={marginSx}
				/>
				<TextField
					id="outlined-multiline-static"
					label="_ // mission remarks"
					fullWidth
					multiline
					rows={12}
					sx={{...marginSx, fontSize: 10}}
					onChange={(e) => setRemarks(e.target.value)}
					value={remarks}
				/>
				<div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
					<Button onClick={onSubmit} variant="outlined">Next</Button>
				</div>
			</DialogContent>
		</div>
	);
};
