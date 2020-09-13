import GetEnumObjectFor from './helpers.js';

let enums = {
    Bulk : { Value: "BULK", Label: "Poids"},
    Box : { Value: "BOX", Label: "Boite"},
    Bunch: { Value: "BUNCH", Label: "Botte"},
    Bouquet : { Value: "BOUQUET", Label: "Bouquet"},
    Piece : { Value: "PIECE", Label: "Pièce"},
    NotSpecified : { Value: "NOT_SPECIFIED", Label: "Non spécifié"}
}

let ConditioningKind = {	
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

Object.keys(enums).map(key => ConditioningKind[key] = enums[key]);
Object.freeze(ConditioningKind);

export default ConditioningKind;