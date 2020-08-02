import GetEnumObjectFor from './helpers.js';

let enums = {
	Producer: { Value: "PRODUCER", Label: "Producteur"},
	Store: { Value: "STORE", Label: "Commerçant"},
	Consumer: { Value: "CONSUMER", Label: "Consommateur"},
};

let ProfileKind = {	
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

Object.keys(enums).map(key => ProfileKind[key] = enums[key]);
Object.freeze(ProfileKind);

export default ProfileKind;