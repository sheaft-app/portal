import Guid from "./Guid";
import ConditioningKind from "../enums/ConditioningKind";

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

export const encodeQuerySearchUrl = address => {
	return address ? encodeURI(`${address.line1} ${address.line2 ? address.line2 : ""} ${address.zipcode}`) : '';
};

export const freezeBody = () => {
	const scroll = window.scrollY;
	const mainContent = document.getElementById('main-content');
	mainContent.style.position = 'fixed';
	mainContent.classList.add('mobile-overflow-hidden');
	mainContent.style.top = `-${scroll - 64}px`;
}

export const unfreezeBody = () => {
	const mainContent = document.getElementById('main-content');

	if (!mainContent.classList.contains('mobile-overflow-hidden')) {
		return;
	}

	const scrollY = parseInt(mainContent.style.top.substring(0, mainContent.style.top.length - 2)) - 64 + 'px';

	mainContent.style.position = '';
	mainContent.classList.remove('mobile-overflow-hidden');
	mainContent.style.top = '';
	window.scrollTo(0, parseInt(scrollY || '0') * -1);
}

export const formatMoney = (price) => `${price.toFixed(2).replace('.',',')}€`;

export const formatConditioningDisplay = (conditioning, quantityPerUnit, unit) => {
	if (!conditioning || conditioning == ConditioningKind.NotSpecified.Value) {
		return '';
	}

	switch (conditioning) {
		case ConditioningKind.Box.Value:
			return `(Boîte de ${quantityPerUnit})`;
		case ConditioningKind.Bunch.Value:
			return `(${quantityPerUnit}) botte${quantityPerUnit > 1 ? 's' : ''})`;
		case ConditioningKind.Bouquet.Value:
			return `(${quantityPerUnit}) bouquet${quantityPerUnit > 1 ? 's' : ''})`;
		case ConditioningKind.Piece.Value:
			return `(${quantityPerUnit}) pièce${quantityPerUnit > 1 ? 's' : ''})`;
		default:
			return `(${quantityPerUnit}${unit})`;
	}
}