import GetEnumObjectFor from './helpers.js';

let enums = {
	BugBounty: { Value: "BUG_BOUNTY", Label: "Déclaration d'un bug"},
	Sponsoring: { Value: "SPONSORING", Label: "Parrainage"},
	PurchaseOrder: { Value: "PURCHASE_ORDER", Label: "Achat"},
	RateProduct: { Value: "RATE_PRODUCT", Label: "Notation"},
};

let PointKind = {	
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

Object.keys(enums).map(key => PointKind[key] = enums[key]);
Object.freeze(PointKind);

export default PointKind;