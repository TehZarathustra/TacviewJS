import React, {useState} from 'react'
import moment from 'moment';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import TextField from '@mui/material/TextField';
import {PlayerReport} from './PlayerReport';
import {WizardStepper} from './WizardStepper';
import {MissionReport} from './MissionReport';
import Paper from '@mui/material/Paper';
// import fin5 from './fin5.gif';
import uTotalsImage from './insert_totals.gif';
import templateImage from './get_template.gif';

// TODO: вынести
const setBodyBg = className => {
	const body = document.body;

	body.className = '';
	body.classList.add(className);
}

export const PlayerReports = ({players, tacview}) => {
	const stats = players.map(player => {
	const data = tacview.getPlayerStatJSON(player);

		return {
			type: 'player',
			label: player,
			...data,
			aaCount: data.aa.length,
			agCount: data.ag.length,
		};
	});
	const mission = {
		type: 'mission',
		label: 'Mission info',
		...tacview.getMission(),
	};

	const [open, setOpen] = React.useState(false);
	const [activeStep, setActiveStep] = React.useState(0);
	const [steps, setSteps] = useState([mission, ...stats]);
	const [template, setTemplate] = useState('');
	const [totalsTemplate, setTotalsTemplate] = useState('');
	const [mergedTotals, setMergedTotals] = useState({});
	const isLast = activeStep === steps.length - 1;

	const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

	const handleClickOpen = () => {
		setBodyBg('process');
		setOpen(true);
	};

	const handleClose = () => {
		setTemplate('');
		setOpen(false);
	};

	const getTotalsTemplate = json => {
		return Object.entries(json.pilots).map(([pilot, entries]) => {
			/*
				Zarathustra
				Missions flown: 25; A/A: 4; A/G: 25; Deaths: 4; A/C lost: 7
				current a/a kill streak: 1
				current a/g kill streak: 11
			*/
			const pilotTemplate = [[
				`${pilot}`,
				`missions flown: ${entries.length}`
			].join('\n')];

			let aaKills = 0;
			let agKills = 0;
			let deaths = 0;
			let lost = 0;
			let totalFlightTime = 0;

			// streak
			let missionStreak = 0;
			let aaStreak = 0;
			let agStreak = 0;

			entries.forEach(entry => {
				const {
					aaCount,
					agCount,
					status,
					landing,
					pattern,
					flightTime,
				} = entry.template;

				aaKills += Number(aaCount);
				aaStreak += Number(aaCount);
				agKills += Number(agCount);
				agStreak += Number(agCount);
				totalFlightTime += flightTime;

				missionStreak++;

				if (status === 'killed') {
					deaths++;
					lost++;

					missionStreak = 0;
					aaStreak = 0;
					agStreak = 0;
				} else if (status !== 'survived') {
					lost++;
				}
			});

			// A/A: 4; A/G: 25; Deaths: 4; A/C lost: 7
			const statRow = [];

			if (aaKills) {
				statRow.push(`A/A: ${aaKills}`);
			}

			if (agKills) {
				statRow.push(`A/G: ${agKills}`);
			}

			if (deaths) {
				statRow.push(`deaths: ${deaths}`);
			}

			if (lost) {
				statRow.push(`A/C lost: ${lost}`);
			}

			const minutes = Math.floor(totalFlightTime / 60);
			const hours = minutes / 60;

			pilotTemplate.push(`total flight time ${Math.floor(hours)}h ${Math.floor((hours - Math.floor(hours)) * 60)}m`);

			if (statRow.length) {
				pilotTemplate.push(statRow.join('; '));
			}

			if (missionStreak) {
				pilotTemplate.push(`current streak\n- missions: ${missionStreak}`);
			}

			if (aaStreak) {
				pilotTemplate.push(`- A/A: ${aaStreak}`);
			}

			if (agStreak) {
				pilotTemplate.push(`- A/G: ${agStreak}`);
			}

			return pilotTemplate.join('\n');
		}).join('\n\n');
	}

	const addMissionMeta = missionEntity => {
		return {
			date: missionEntity.irltime,
			mission: missionEntity,
		};
	}

	const onPreDownload = () => {
		const totals = steps.reduce((result, item) => {
			if (item.type === 'mission') {
				return {
					...result,
					lastMission: item,
				};
			}

			if (item.type === 'player') {
				// omit events
				result.pilots = {
					...result.pilots,
					[item.name]: [{
						...item,
						...addMissionMeta(result.lastMission),
					}]
				};
			}

			return result;
		}, {pilots: {}});

		const linkNode = document.createElement('a');
		const blob = new Blob([JSON.stringify(totals)], {type: 'text/plain'});
		const url = window.URL.createObjectURL(blob);

		linkNode.style = 'display: none';
		linkNode.href = url;
		linkNode.download = `${totals.lastMission?.title}_totals.json`;

		document.body.appendChild(linkNode);

		linkNode.click();
	}

	const onTotalsDownload = () => {
		const linkNode = document.createElement('a');
		const blob = new Blob([JSON.stringify(mergedTotals)], {type: 'text/plain'});
		const url = window.URL.createObjectURL(blob);

		linkNode.style = 'display: none';
		linkNode.href = url;
		linkNode.download = `${mergedTotals.lastMission?.title}_totals.json`;

		document.body.appendChild(linkNode);

		linkNode.click();
	}

	const mergeTotals = totals => {
		const mission = steps.find(({type}) => type === 'mission');

		totals.lastMission = mission;

		const missionPilots = new Set([
			...Object.keys(totals.pilots),
			...steps.reduce((result, item) => {
					if (item.type === 'player') result.push(item.name);

					return result;
				}, [])
			]);

		Array.from(missionPilots).forEach(pilot => {
			// @TODO map other names
			const entry = steps.find(({name}) => name === pilot);

			const payload = {...entry, ...addMissionMeta(mission)};

			if (entry && totals.pilots[pilot]) {
				totals.pilots[pilot].push(payload);
			} else if (entry) {
				totals.pilots[pilot] = [payload];
			}
		});

		return {...totals};
	}

	const onTotals = (e) => {
		const fileReader = new FileReader();
		const file = e.target?.files[0];

		fileReader.onload = function(e) {
			const json = JSON.parse(e.target.result);
			const mergedTotals = mergeTotals(json);
			const template = `**Campaign stats**\n\`\`\`${getTotalsTemplate(mergedTotals)}\`\`\``;

			setMergedTotals(mergedTotals);
			setTotalsTemplate(template);
		};

		if (file) {
			fileReader.readAsText(file);
		}
	}

	const getTemplate = () => {
		const getMissionTemplate = template => {
			const {
				editedDuration,
				missiontime,
				remarks,
				status,
				title,
			} = template;

			/*
				mirgssy_p3_m7 | kinda success
				Hunted down two SA-8s, provided CAS for friendly forces
				Got hit by a massive case of skill issue

				Only one F-1EE remains
			*/
			const result = [
				`**${title} | ${status}**`,
				`*date: ${missiontime}*`,
				`*duration: ${editedDuration}*`,
			];

			if (remarks) result.push(`\n${remarks}`);

			return result.join('\n');
		};

		const getPlayerTemplate = template => {
			const {
				pilot,
				aircraft,
				aaText,
				agText,
				status,
				pattern,
				landing,
				reason,
				remarks,
				flightTime,
			} = template;

			const ratingMapper = {
				unsafe: '🟥',
				safe: '🟨',
				good: '🟩',
				perfect: '🟦',
			};

			const result = [
				`${pilot} (${aircraft})${status !== 'survived' ? ', ' + status : ''}`,
				`flight time: ${Math.floor(flightTime/60)} minutes`
			];

			if (aaText && agText) {
				result.push(`a/a: ${aaText}; a/g: ${agText}`);
			} else if (aaText) {
				result.push(`a/a: ${aaText}`);
			} else if (agText) {
				result.push(`a/g: ${agText}`);
			}

			if (pattern) result.push(`pattern: ${ratingMapper[pattern]}`);
			if (landing) result.push(`landing: ${ratingMapper[landing]}`);

			if (reason) result.push(reason);
			if (remarks) result.push(remarks);

			/*
				Pixelberg (Mirage F1C)
				a/g: ZU-23-2
				pattern: 🟦
				landing: 🟩
			*/
			return result.join('\n');
		}

		const result = steps.map((item) => {
			if (item.type === 'mission') {
				return getMissionTemplate(item.template) + '\n```';
			}

			return getPlayerTemplate(item.template) + '\n';
		});

		onTotalsDownload();

		return setTemplate(result.join('\n') + '```');
	}

	const onNext = data => {
		setSteps(steps => steps.map((item, index) => {
			if (index === activeStep) {
				return data;
			}

			return item;
		}));

		handleNext();
	};

	const onPrev = data => {
		setSteps(steps => steps.map((item, index) => {
			if (index === activeStep) {
				return data;
			}

			return item;
		}));

		handleBack();
	};

	const activeItem = steps[activeStep];

	return (
		<div>
			<Button size="large" variant="outlined" onClick={handleClickOpen}>
				inspect and proceed
			</Button>
			<Dialog open={open} onClose={handleClose} maxWidth="lg" className="card-bg" >
				{!template ? <div style={{display: 'grid', gridTemplateColumns: '200px 500px 350px', gap: '20px'}}>
					<WizardStepper activeStep={activeStep} steps={steps} />
					<div style={{boxSizing: 'border-box', padding: '20px', display: 'flex', flexDirection: 'column'}}>
						{(Boolean(steps[activeStep]) && (steps[activeStep]?.type === 'mission'
						 	? <MissionReport onNext={onNext} key={activeItem.label} data={activeItem} />
						 	: <PlayerReport
						 		onPrev={onPrev}
						 		onNext={onNext}
						 		key={activeItem.label}
						 		data={activeItem}
						 	/>))
						 || <div>
						 	<Card>
                <CardMedia
                  sx={{height: 500}}
                  image={!Boolean(totalsTemplate) ? uTotalsImage : templateImage}
                  title="finished"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                   {!Boolean(totalsTemplate)
                   	? 'Now insert floppy disk with totals'
                   	: 'The disk is updated, ready to print'
                   }
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                  	{!Boolean(totalsTemplate)
                  		? 'If you don\'t have it, ask a fellow colleague'
                    	: 'The new floppy disc will be ejected upon printing'
                    }
                  </Typography>
                </CardContent>
                <CardActions sx={{justifyContent: 'flex-end'}}>
                  <Button onClick={handleBack}>go back</Button>
                  {/*<Button onClick={onPreDownload}>get sample</Button>*/}
                  {!Boolean(totalsTemplate) && <Button variant="outlined" component="label">
                  	insert totals
						        <input hidden accept=".json" type="file" onChange={onTotals} />
						      </Button>}
                  {Boolean(totalsTemplate) && <Button variant="outlined" onClick={getTemplate}>generate template</Button>}
                </CardActions>
              </Card>
						 </div>}
					</div>
					{Boolean(activeItem || steps.length > 0) && <pre
						className="finished-bg-second"
						style={{margin: 0, padding: '10px', maxHeight: '90vh', overflowY: 'scroll', overflowX: 'hidden'}}
					>{JSON.stringify(activeItem || steps, undefined, 2)}</pre>}
				</div> : <div style={{width: '800px'}}>
						<TextField
		          label="Debriefing template"
		          multiline
		          maxRows={100}
		          defaultValue={template}
		          fullWidth
		          variant="filled"
		        />
		        <TextField
		          label="Totals template"
		          multiline
		          maxRows={100}
		          defaultValue={totalsTemplate}
		          fullWidth
		          variant="filled"
		        />
	       </div>}
			</Dialog>
		</div>
	);
};
