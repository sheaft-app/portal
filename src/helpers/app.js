import Guid from "./Guid";

export const timeSpanToFrenchHour = (timeSpan) => {
	if (!timeSpan) {
		return;
	}
	
	const slots = timeSpan.split(':');
	return `${slots[0]}h${slots[1]}`;
}
export const timeToTimeSpan = (time) => 
	`${time.hours ? time.hours : '00'}:${time.minutes ? time.minutes : '00'}:${time.seconds ? time.seconds : '00'}`;

export const timeSpanToTime = (timeSpan) => {
	if (!timeSpan) {
		return {
			hours: '0',
			minutes: '0',
			seconds: '0'
		}
	}

	const slots = timeSpan.split(':');
	return {
		hours: parseInt(slots[0] ? slots[0] : '0'),
		minutes: parseInt(slots[1] ? slots[1] : '0'),
		seconds: parseInt(slots[2] ? slots[2] : '0'),
	};
};

export const groupBy = (array, f) => {
	var groups = {};
	array.forEach((o) => {
		var group = JSON.stringify(f(o));
		groups[group] = groups[group] || [];
		groups[group].push(o);
	});

	return Object.keys(groups).map((group) => groups[group]);
}

export const denormalizeOpeningHours = (openingHours) => 
	groupBy(openingHours, (item) => [item.from, item.to]).map((group) => {
		let days = [];

		for (var i = 0; i < group.length; i++){
			days = days.concat(group[i].day);
		}

		return {
			id: Guid.NewGuid(),
			days,
			start: timeSpanToTime(group[0].from),
			end: timeSpanToTime(group[0].to)
		}
	})
;

export const normalizeOpeningHours = (openingHours) =>
	openingHours.map((openingHour) => {
		return {
			days: openingHour.days.filter((d) => d.checked).map((d) => d.Value),
			from: timeToTimeSpan(openingHour.start),
			to: timeToTimeSpan(openingHour.end)
		}
	});
;

export const roundMoney = (num) =>
	Math.round((num + Number.EPSILON) * 100) / 100;

export const removeKeys = (obj, keys) => {
	for (var prop in obj) {
		if(obj.hasOwnProperty(prop)) {
			switch(typeof(obj[prop])) {
				case 'object':
					if(keys.indexOf(prop) > -1) {
						delete obj[prop];
					} else {
						removeKeys(obj[prop], keys);
					}
					break;
			default:
				if(keys.indexOf(prop) > -1) {
					delete obj[prop];
				}
				break;
			}
		}
	}
}