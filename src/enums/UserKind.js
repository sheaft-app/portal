import GetEnumObjectFor from './helpers.js';

let enums = {
    Owner : { Value: "OWNER", Label: "Propriétaire"},
    User : { Value: "USER", Label: "Utilisateur"},
    Consumer : { Value: "CONSUMER", Label: "Consommateur"}
}

let UserKind = {
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

Object.keys(enums).map(key => UserKind[key] = enums[key]);
Object.freeze(UserKind);

export default UserKind;
