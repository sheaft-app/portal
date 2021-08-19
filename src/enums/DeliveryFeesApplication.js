import GetEnumObjectFor from "./helpers.js";

let enums = {
	Always: { Value: "ALWAYS", Label: "Toute les commandes" },
	TotalLowerThanPurchaseOrderAmount: { Value: "TOTAL_LOWER_THAN_PURCHASE_ORDER_AMOUNT", Label: "Pour les commandes inférieures" },
};

let DeliveryFeesApplication = {
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

Object.keys(enums).map((key) => (DeliveryFeesApplication[key] = enums[key]));
Object.freeze(DeliveryFeesApplication);

export default DeliveryFeesApplication;
