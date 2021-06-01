import GetEnumObjectFor from "./helpers.js";

let enums = {
	Billing: { Value: "BILLING", Label: "Facturation" },
	Shipping: { Value: "SHIPPING", Label: "Livraison" },
	Legals: { Value: "LEGALS", Label: "Administrative" },
	Contact: { Value: "CONTACT", Label: "Contact" },
};

let AddressKind = {
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

Object.keys(enums).map((key) => (AddressKind[key] = enums[key]));
Object.freeze(AddressKind);

export default AddressKind;
