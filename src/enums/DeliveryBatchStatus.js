import GetEnumObjectFor from "./helpers.js";

let enums = {
	Waiting: { Value: "WAITING", Label: "En attente" },
	Ready: { Value: "READY", Label: "Prête" },
	InProgress: { Value: "IN_PROGRESS", Label: "En cours" },
	Delivered: { Value: "DELIVERED", Label: "Livrée" },
	Completed: { Value: "COMPLETED", Label: "Terminée" },
	Partial: { Value: "PARTIAL", Label: "Partielle" },
	Cancelled: { Value: "CANCELLED", Label: "Annulée" },
};

let DeliveryBatchStatus = {
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

Object.keys(enums).map((key) => (DeliveryBatchStatus[key] = enums[key]));
Object.freeze(DeliveryBatchStatus);

export default DeliveryBatchStatus;
