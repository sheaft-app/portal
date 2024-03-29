import GetEnumObjectFor from "./helpers.js";

let enums = {
	Waiting: { Value: "WAITING", Label: "Livraison en attente" },
	Ready: { Value: "READY", Label: "Livraison programée" },
	InProgress: { Value: "IN_PROGRESS", Label: "Livraison en cours" },
	Delivered: { Value: "DELIVERED", Label: "Livrée" },
	Skipped: { Value: "SKIPPED", Label: "Livraison décalée" },
	Rejected: { Value: "REJECTED", Label: "Livraison refusée" },
};

let DeliveryStatus = {
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

Object.keys(enums).map((key) => (DeliveryStatus[key] = enums[key]));
Object.freeze(DeliveryStatus);

export default DeliveryStatus;
