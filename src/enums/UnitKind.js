import GetEnumObjectFor from './helpers.js';

let enums = {
    ML : { Value: "ML", Label: "ml"},
    L: { Value: "L", Label: "L"},
    G : { Value: "G", Label: "g"},
    KG : { Value: "KG", Label: "kg"},
    Unit : { Value: "UNIT", Label: "unité"}
}

let UnitKind = {	
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

Object.keys(enums).map(key => UnitKind[key] = enums[key]);
Object.freeze(UnitKind);

export default UnitKind;