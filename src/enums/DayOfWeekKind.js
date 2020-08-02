import GetEnumObjectFor from './helpers.js';

let enums = {
	Monday: { Value: "MONDAY", Label: "Lundi"},
	Tuesday: { Value: "TUESDAY", Label: "Mardi"},
	Wednesday: { Value: "WEDNESDAY", Label: "Mercredi"},
	Thursday: { Value: "THURSDAY", Label: "Jeudi"},
	Friday: { Value: "FRIDAY", Label: "Vendredi"},
	Saturday: { Value: "SATURDAY", Label: "Samedi"},
	Sunday: { Value: "SUNDAY", Label: "Dimanche"},
};

let DayOfWeekKind = {	
	get: (value) => {
		return GetEnumObjectFor(enums, value);
	},
	label: (value) => {
		return GetEnumObjectFor(enums, value).Label;
	},
	value: (value) => {
		return GetEnumObjectFor(enums, value).Value;
	},
	color: (value) => {
		return GetEnumObjectFor(enums, value).Color;
	},
	icon: (value) => {
		return GetEnumObjectFor(enums, value).Icon;
	}
};

Object.keys(enums).map(key => DayOfWeekKind[key] = enums[key]);
Object.freeze(DayOfWeekKind);

export default DayOfWeekKind;