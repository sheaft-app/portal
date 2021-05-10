import GetEnumObjectFor from './helpers.js';

let enums = {
	None: { Value: "NONE", Label: "Non spécifié"},
	Technical: { Value: "TECHNICAL", Label: "Technique"},
	Business: { Value: "BUSINESS", Label: "Métier"},
};

let NotificationKind = {
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

Object.keys(enums).map(key => NotificationKind[key] = enums[key]);
Object.freeze(NotificationKind);

export default NotificationKind;
