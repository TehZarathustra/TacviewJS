import React, {useState} from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import fin5 from './fin5.gif';
import FormControl from '@mui/material/FormControl';
import {red, yellow, green, blue} from '@mui/material/colors';

export const Rating = ({title, value, onChange, onClick}) => {
	const [open, setOpen] = useState(false);

	const getSxMod = color => {
		return {
			color: color[800],
			'&.Mui-checked': {
				color: color[600],
			},
		};
	}

	const items = [
		{value: 'unsafe', color: red},
		{value: 'safe', color: yellow},
		{value: 'good', color: green},
		{value: 'perfect', color: blue},
	];

	return (
		<div>
			<FormControl>
				<FormLabel id={title}>{title}</FormLabel>
				<RadioGroup
					row
					aria-labelledby="rating"
					name={title}
					value={value}
					// onClick={() => setOpen(true)}
					onChange={(e) => onChange(e.target.value)}
				>

				{items.map(({value, color}) => <FormControlLabel
						value={value}
						key={value}
						control={<Radio sx={getSxMod(color)} />}
					/>
				)}
				</RadioGroup>
			</FormControl>
			{/*<Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" >
				<Card>
          <CardMedia
            sx={{height: 500}}
            image={fin5}
            title="finished"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              Pattern entry
            </Typography>
            <Typography variant="body2" color="text.secondary">
              alt(ft) speed(kts)
            </Typography>
          </CardContent>
          <CardActions sx={{justifyContent: 'flex-end'}}>
            <Button>go back</Button>
          </CardActions>
        </Card>
			</Dialog>*/}
		</div>
	);
}
