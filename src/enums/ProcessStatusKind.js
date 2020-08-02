import GetEnumObjectFor from './helpers.js';

let enums = {
	Rollbacked: { Value: "ROLLBACKED", Label: "Réinitialisé", Color:"gray"},
	Failed: { Value: "FAILED", Label: "Erreur", Color:"red"},
	Cancelled: { Value: "CANCELLED", Label: "Annulé", Color:"gray"},
	Waiting: { Value: "WAITING", Label: "En attente", Color:"orange"},
	Processing: { Value: "PROCESSING", Label: "En cours", Color:"teal"},
	Paused: { Value: "PAUSED", Label: "Interrompu", Color:"yellow"},
	Done: { Value: "DONE", Label: "Terminé", Color:"green"},
	Expired: { Value: "EXPIRED", Label: "Expiré", Color:"gray"},
};

let ProcessStatusKind = {	
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

Object.keys(enums).map(key => ProcessStatusKind[key] = enums[key]);
Object.freeze(ProcessStatusKind);

export default ProcessStatusKind;