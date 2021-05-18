import GetEnumObjectFor from './helpers.js';

let enums = {
	None: { Value: "NONE", Label: "Personne"},
	All: { Value: "ALL", Label: "Tous"},
	Consumers: { Value: "CONSUMERS", Label: "Consommateurs"},
	Stores: { Value: "STORES", Label: "Professionels"},
};

let VisibleToKind = {
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
	}
};

Object.keys(enums).map(key => VisibleToKind[key] = enums[key]);
Object.freeze(VisibleToKind);

export default VisibleToKind;
