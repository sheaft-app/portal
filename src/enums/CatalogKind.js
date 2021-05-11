import GetEnumObjectFor from './helpers.js';

let enums = {
	Consumers: { Value: "CONSUMERS", Label: "Consommateurs"},
	Stores: { Value: "STORES", Label: "Professionels"}
};

let CatalogKind = {
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

Object.keys(enums).map(key => CatalogKind[key] = enums[key]);
Object.freeze(CatalogKind);

export default CatalogKind;
