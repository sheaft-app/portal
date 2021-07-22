import GetEnumObjectFor from "./helpers.js";

let enums = {
	RCS: { Value: "RCS", Label: "Registre du commerce et des sociétés" },
	RM: { Value: "RM", Label: "Répertoire des métiers" },
	NotSpecified: { Value: "NA", Label: "Non applicable" },
};

let RegistrationKind = {
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

Object.keys(enums).map((key) => (RegistrationKind[key] = enums[key]));
Object.freeze(RegistrationKind);

export default RegistrationKind;
