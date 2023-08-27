import React, {useState, useRef} from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Theme, useTheme } from '@mui/material/styles'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import {tacviewJS} from '../../core/src/lib';
import {PlayerReports} from './PlayerReports';
import ListSubheader from '@mui/material/ListSubheader';
import SaveIcon from '@mui/icons-material/Save';
import './App.css'
import insertImage from './insert.gif';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, prependNames: readonly string[], theme: Theme) {
  return {
    fontWeight:
      prependNames.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const setBodyBg = className => {
	const body = document.body;

	body.className = '';
	body.classList.add(className);
}

function App() {
	const theme = useTheme();
	const [tacview, setTacview] = useState(null);
	const [players, setPlayers] = useState([]);
	const [prependNames, setPrependNames] = React.useState<string[]>([]);
	const [briefingItems, setBriefingItems] = useState([]);
	const [dValue, setDValue] = useState('');
	const [editedText, setEditedText] = useState('');
	const [JSONStats, setJSONStats] = useState([]);
	const [loading, setLoading] = useState(false);

	const onChange = function (e) {
		const fileReader = new FileReader();
		const file = e.target?.files[0];

		fileReader.onload = function(e) {
			const text = e.target.result.replace(/[\s\S]+<\?xml/, '<?xml');
			const tacview = tacviewJS(text);

			if (!tacview) {
				setTimeout(() => {
					setBodyBg('error-bg');
					setLoading(false);
				}, 1000);

				return;
			}

			setTacview(tacview);
			setBodyBg('finished-bg-second');
			setLoading(false);
		};

		if (file) {
			setLoading(true);
			setBodyBg('loading');

			setTimeout(() => fileReader.readAsText(file), 1000);
		}
	}

	const getPlayers = () => {
		setPlayers([
			{flight: 'Dodge', list: tacview.getPlayersByGroup('Dodge')},
			{flight: 'Ford', list: tacview.getPlayersByGroup('Ford')},
			{flight: 'Chevy', list: tacview.getPlayersByGroup('Chevy')},
		]);
	}

	const setStatHandler = () => {
		const template = [];
		const mission = `**${tacview.getMission().title} | success**\n\n`
		const stats = [];

		prependNames.forEach(player => {
			template.push(tacview.getPlayerStat(player));
			stats.push(tacview.getPlayerStatJSON(player));
		});

		setJSONStats(stats);
		setEditedText('');
		// setDValue(mission + `\`\`\`\n${template.join('\n\n')}\n\`\`\``);
		setBodyBg('process');
	}

	const handleChange = (event: SelectChangeEvent<typeof prependNames>) => {
		const {target: {value}} = event;

		setPrependNames(
			// On autofill we get a stringified value.
			typeof value === 'string' ? value.split(',') : value,
		);
	};

	const kekw = Date.now();

  return (
  	<ThemeProvider theme={darkTheme}>
	    <div className="App">
	    	<h5 style={{position: 'absolute', top: '-10px', left: '10px', opacity: '.6'}}>_ // fileReader.readAsText(e.target.files[0])</h5>
	      {!tacview && <div className="card">
	      	{/*<div><img src={insertImage} /></div>*/}
	      	<Button variant="outlined" component="label" size="large" endIcon={<SaveIcon />}>
		        {loading ? 'loading...' : 'Insert'}
		        <input hidden accept="text/xml" type="file" onChange={onChange} />
		      </Button>
	        {loading ? <h4 style={{opacity: '.8'}}>
	         {'insert a disk into machine to start generating a debriefing sequence //...'.split(' ').reverse().join(' ')}
	        </h4> : <h4 style={{opacity: '.8'}}>
	         // insert a floppy disk into the device to start generating a summary sequence
	        </h4>}
	      </div>}
	      {Boolean(tacview && !players.length) && <div>
	      	<pre>_ // the data disk is loaded into the system{'\n' + tacview.toString()}</pre>
	      	<pre># available methods{'\n'}{Object.keys(tacview).join('\n')}</pre>
	      	<Button size="large" variant="outlined" onClick={getPlayers}>
	      		[...getPlayersByGroup('Dodge'), ...getPlayersByGroup('Ford'), ...getPlayersByGroup('Chevy')]
	      	</Button>
	    	</div>}
	      {Boolean(players.length) && <div>
	      	<div>
						<FormControl sx={{m: 1, minWidth: 300}}>
							<InputLabel htmlFor="grouped-select">_ // order</InputLabel>
							<Select
								id="grouped-select"
								label="Grouping"
								multiple
								defaultValue={[]}
								value={prependNames}
								onChange={handleChange}
								renderValue={(selected) => (
			            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
			              {selected.map((value) => (
			                <Chip key={value} label={value} />
			              ))}
			            </Box>
			          )}
							>
								{(() => {
									const items = [];

									players.forEach(({flight, list}) => {
										items.push(<ListSubheader key={flight}>{flight}</ListSubheader>);

										list.forEach(player => {
											items.push(<MenuItem key={player} value={player}>{player}</MenuItem>)
										})
									});

									return items;
								})()}
							</Select>
						</FormControl>

		        <p style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
		        	{prependNames.length > 0 && <PlayerReports
		        		key={kekw}
		        		players={prependNames}
		        		tacview={tacview}
		        	/>}
		        	{/*<Button onClick={setStatHandler} size="large" variant="outlined">
		        		getPlayerStatJSON(players)
		        	</Button>*/}
		        </p>
		    	</div>
	    	</div>}
	    	<div style={{width: '1000px'}}>
		    	{Boolean(dValue) && <TextField
	          label="Actual debriefing"
	          multiline
	          onChange={(e) => {setDValue(e.target.value)}}
	          maxRows={100}
	          fullWidth
	          variant="filled"
	          value={dValue}
	        />}
        </div>
	    </div>
    </ThemeProvider>
  )
}

export default App
