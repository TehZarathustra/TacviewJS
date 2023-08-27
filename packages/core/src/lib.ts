import {XMLParser} from 'fast-xml-parser';
/*
<Type>Aircraft</Type>
<Name>Mirage F1</Name>
<Pilot>Marks 1-1 | Zar</Pilot>
<Coalition>Enemies</Coalition>
<Country>xb</Country>
<Group>Uzi-1</Group>
*/
// interface Player {

// }

const pilotFinder = (player: any) => ({primaryobject, parentobject, secondaryobject}: any) => {
	return primaryobject?.pilot === player
		|| parentobject?.pilot === player
		|| secondaryobject?.pilot === player;
};

const getRawPlayerTimeline = (events: any, player: any) =>
	events.filter(pilotFinder(player));

const getPlayerInfo = (event: any) => {
	const {group, name, pilot, coalition} = event.primaryobject;

	return {
		name: pilot,
		flight: group,
		aircraft: name,
		coalition,
	};
}

const getWeaponInfo = ({type, name, parent}: any) => {
	return {
		weaponType: type,
		weapon: name,
		link: parent,
	}
}

const isInPrimary = ({pilot}: any, player: any) => pilot === player;

const hasEnteredTransformer = ({primaryobject, action, airport, ...rest}: any) => {
	return {
		action: 'spawned',
		aircraft: primaryobject.name,
		airport: airport?.name,
		...rest
	};
}

const hasTakenOffTransformer = ({primaryobject, action, airport, ...rest}: any) => {
	return {
		action: 'takeoff',
		airport: airport?.name,
		...rest
	};
}

const hasFiredTransformer = ({primaryobject, secondaryobject, action, airport, ...rest}: any) => {
	return {
		action: 'fired',
		...getWeaponInfo(secondaryobject),
		...rest
	};
}

const hasBeenHitByTransformer = ({primaryobject, secondaryobject, action, parentobject, ...rest}: any, player: any) => {
	const isHitBy = isInPrimary(primaryobject, player);

	const hitObj = isHitBy ? parentobject : primaryobject;

	return {
		action: isHitBy ? 'hitBy' : 'hit',
		...getWeaponInfo(secondaryobject),
		...hitObj,
		...rest
	}
}

const hasBeenDestroyedTransformer = ({primaryobject, secondaryobject, action, parentobject, ...rest}: any, player: any) => {
	const isKilled = isInPrimary(primaryobject, player);

	const killObj = isKilled ? parentobject : primaryobject;

	return {
		action: isKilled ? 'death' : 'kill',
		killType: !isKilled ? (killObj?.type === 'Aircraft' ? 'a/a' : 'a/g') : null,
		...killObj,
		...rest
	}
}

const hasLandedTronsformer = ({primaryobject, action, airport, ...rest}: any) => {
	return {
		action: 'landed',
		airport: airport?.name,
		...rest
	};
}

const hasLeftTheAreaTronsformer = ({primaryobject, action, airport, ...rest}: any) => {
	return {
		action: 'disconnected',
		airport: airport?.name,
		...rest
	};
}

const transformHOC = (player: any) => {
	return (event: any) => {
		const eventTypes: any = {
			HasEnteredTheArea: hasEnteredTransformer,
			HasTakenOff: hasTakenOffTransformer,
			HasFired: hasFiredTransformer,
			HasBeenHitBy: hasBeenHitByTransformer,
			HasBeenDestroyed: hasBeenDestroyedTransformer,
			HasLanded: hasLandedTronsformer,
			HasLeftTheArea: hasLeftTheAreaTronsformer,
		};

		if (eventTypes[event.action]) {
			return eventTypes[event.action](event, player);
		}

		return event;
	}
}

const getPlayerTimeline = (events: any, player: any) => {
	const rawTimeline = getRawPlayerTimeline(events, player);
	const playerInfo = getPlayerInfo(rawTimeline[0]);

	return {
		...playerInfo,
		events: rawTimeline.map(transformHOC(player))
	};
}

const getKills = (timelineEvents: any) => {
	return timelineEvents.reduce((result: any, event: any) => {
		if (event.action === 'kill') {
			if (event.killType === 'a/a') {
				result.aa.push(event.name);
			} else {
				result.ag.push(event.name);
			}
		}

		return result;
	}, {aa: [], ag: []});
}

/*
Zarathustra (Mirage F-1EE)
a/a: MiG-23
pattern: 🟩
landing: 🟩
*/
const getPlayerStat = (events: any, player: any) => {
	const timeline = getPlayerTimeline(events, player);

	const title = `${timeline.name} (${timeline.aircraft})`;
	const {aa, ag} = getKills(timeline.events);
	const aaKills = aa.join(', ');
	const agKills = ag.join(', ');

	const killsTemplate = [];

	if (aaKills) {
		killsTemplate.push(`a/a: ${aaKills}`);
	}

	if (agKills) {
		killsTemplate.push(`a/g: ${agKills}`);
	}

	const landingTemplate = `pattern: 🟥🟨🟩🟦\nlanding: 🟥🟨🟩🟦`;

	return `${title}\n${killsTemplate.join('; ')}\n${landingTemplate}`;
}

const getPlayerStatJSON = (events: any, player: any) => {
	const timeline = getPlayerTimeline(events, player);

	const {aa, ag} = getKills(timeline.events);
	// const aaKills = aa.join(', ');
	// const agKills = ag.join(', ');

	const flightTime = timeline.events.reduce((result: any, {action, time}: any) => {
		if (action === 'takeoff') {
			result.push(Math.floor(time));
		}

		if (action === 'landed' || action === 'death' || action === 'disconnected') {
			const copy = [...result];

			if (copy.length > 0 && !Array.isArray(copy.pop())) {
				result.push([Math.floor(time) - result.pop()]);
			}
		}

		return result;
	}, []).reduce((result: any, item: any) => {
		return result + Math.floor(item);
	}, 0);

	return {
		...timeline,
		isAlive: !timeline.events.some(({action}: any) => action === 'death'),
		aa,
		ag,
		flightTime,
		pattern: '',
		landing: '',
	}
}

const getPlayerList = (events: any, {byGroup, byType}: any = {}) => {
	// New Set?
	return Array.from(events.reduce((result: any, {primaryobject: {pilot, group, type}}: any) => {
		// by type
		if (byType === type) result.add(pilot);

		// by pattern
		if (byGroup?.test(group)) result.add(pilot);

		return result;
	}, new Set()));
}

const getPlayersByGroup = (events: any, group: any) => {
	if (!group) return [];

	return getPlayerList(events, {byGroup: RegExp(group)});
}

export const tacviewJS = (xml: any) => {
	const {tacviewdebriefing} = new XMLParser({
		ignoreDeclaration: true,
		transformTagName: tagName => tagName.toLowerCase()
	}).parse(xml);

	if (!tacviewdebriefing) return null;

	console.log('tacviewdebriefing >>>', tacviewdebriefing);

	const {
		events: {event},
		flightrecording: {recordingtime},
		mission,
	} = tacviewdebriefing;

	return {
		getPlayerList: getPlayerList.bind(null, event),
		getPlayersByGroup: getPlayersByGroup.bind(null, event),
		getRawPlayerTimeline: getRawPlayerTimeline.bind(null, event),
		getPlayerTimeline: getPlayerTimeline.bind(null, event),
		getPlayerStat: getPlayerStat.bind(null, event),
		getPlayerStatJSON: getPlayerStatJSON.bind(null, event),
		getMission: () => ({...mission, irltime: recordingtime})
	}
}
