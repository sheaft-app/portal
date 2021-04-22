import GetEnumObjectFor from './helpers.js';

let enums = {
    NOT_SPECIFIED : { Value: "NOT_SPECIFIED", Label: "Non spécifié"},
    CREATED : { Value: "CREATED", Label: "Créée"},
    SUCCEEDED: { Value: "SUCCEEDED", Label: "Succès"},
    FAILED : { Value: "FAILED", Label: "Échec"}
}

let PreAuthorizationStatus = {	
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

Object.keys(enums).map(key => PreAuthorizationStatus[key] = enums[key]);
Object.freeze(PreAuthorizationStatus);

export default PreAuthorizationStatus;