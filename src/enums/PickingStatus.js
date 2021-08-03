import GetEnumObjectFor from "./helpers.js";

let enums = {
	Waiting: { Value: "WAITING", Label: "En attente" },
	Completed: { Value: "COMPLETED", Label: "Terminée" },
	InProgress: { Value: "IN_PROGRESS", Label: "En cours" },
	Paused: { Value: "PAUSED", Label: "En pause" },
};

let PickingStatus = {
	...enums,
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
	},
};

Object.keys(enums).map((key) => (PickingStatus[key] = enums[key]));
Object.freeze(PickingStatus);

export default PickingStatus;
