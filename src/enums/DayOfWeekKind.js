import GetEnumObjectFor from "./helpers.js";

let enums = {
	Monday: { Value: "MONDAY", Label: "Lundi", Index: 0 },
	Tuesday: { Value: "TUESDAY", Label: "Mardi", Index: 1 },
	Wednesday: { Value: "WEDNESDAY", Label: "Mercredi", Index: 2 },
	Thursday: { Value: "THURSDAY", Label: "Jeudi", Index: 3 },
	Friday: { Value: "FRIDAY", Label: "Vendredi", Index: 4 },
	Saturday: { Value: "SATURDAY", Label: "Samedi", Index: 5 },
	Sunday: { Value: "SUNDAY", Label: "Dimanche", Index: 6 },
};

let DayOfWeekKind = {
	...enums,
	get: (value) => {
		return GetEnumObjectFor(enums, value);
	},
	getDaysWithIndexNotIn: (indexes) => {
		let days = Object.keys(enums).filter((key) => !indexes.includes(enums[key].Index));
		return days.map((d) => GetEnumObjectFor(enums, d.toUpperCase()));
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
	},
};

Object.keys(enums).map((key) => (DayOfWeekKind[key] = enums[key]));
Object.freeze(DayOfWeekKind);

export default DayOfWeekKind;
