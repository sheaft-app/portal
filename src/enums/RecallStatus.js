import GetEnumObjectFor from "./helpers.js";

let enums = {
	Waiting: { Value: "WAITING", Label: "En attente de confirmation" },
	Ready: { Value: "READY", Label: "En attente d'envoi" },
	Sending: { Value: "SENDING", Label: "En cours d'envoi" },
	Sent: { Value: "SENT", Label: "Envoyée" },
	Failed: { Value: "FAILED", Label: "Echec" },
};

let RecallStatus = {
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

Object.keys(enums).map((key) => (RecallStatus[key] = enums[key]));
Object.freeze(RecallStatus);

export default RecallStatus;
