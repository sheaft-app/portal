import GetEnumObjectFor from "./helpers.js";

let enums = {
	ToDeliver: { Value: "TO_DELIVER", Label: "À livrer" },
	Missing: { Value: "MISSING", Label: "Manquant" },
	Broken: { Value: "BROKEN", Label: "Cassé" },
	Improper: { Value: "IMPROPER", Label: "Non conforme" },
	Excess: { Value: "EXCESS", Label: "En trop" },
};

let DeliveryKind = {
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

Object.keys(enums).map((key) => (DeliveryKind[key] = enums[key]));
Object.freeze(DeliveryKind);

export default DeliveryKind;
