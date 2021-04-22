import GetEnumObjectFor from './helpers.js';

let enums = {
	Organization: { Value: "ORGANIZATION", Label: "Association ou collectivité"},
	Business: { Value: "BUSINESS", Label: "Société"},
	Individual: { Value: "INDIVIDUAL", Label: "Individuel"},
};

let LegalKind = {
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

Object.keys(enums).map(key => LegalKind[key] = enums[key]);
Object.freeze(LegalKind);

export default LegalKind;
