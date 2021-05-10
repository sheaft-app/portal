import {
	faQuestion,
	faThumbsUp,
	faCircleNotch,
	faCheck,
	faTimes,
	faSpinner,
	faTruck,
	faTruckLoading
} from "@fortawesome/free-solid-svg-icons";
import GetEnumObjectFor from './helpers.js';

export const PurchaseOrderStatus = {
	WAITING: "WAITING",
	ACCEPTED: "ACCEPTED",
	PROCESSING: "PROCESSING",
	COMPLETED: "COMPLETED",
	SHIPPING: "SHIPPING",
	DELIVERED: "DELIVERED",
	REFUSED: "REFUSED",
	CANCELLED: "CANCELLED",
	WITHDRAWNED: "WITHDRAWNED",
	EXPIRED: "EXPIRED",
	NONE: "NONE",
};

let enums = {
	Waiting: {
		Value: "WAITING",
		Label: "En attente",
		Icon: faSpinner,
		Color: "blue-400",
	},
	Accepted: {
		Value: "ACCEPTED",
		Label: "Acceptée",
		Icon: faThumbsUp,
		Color: "green-500",
	},
	Processing: {
		Value: "PROCESSING",
		Label: "En préparation",
		Icon: faCircleNotch,
		Color: "green-500",
	},
	Completed: {
		Value: "COMPLETED",
		Label: "Prête",
		Icon: faCheck,
		Color: "green-500",
	},
	Shipping: {
		Value: "SHIPPING",
		Label: "En livraison",
		Icon: faTruck,
		Color: "green-500",
	},
	Delivered: {
		Value: "DELIVERED",
		Label: "Livrée",
		Icon: faTruckLoading,
		Color: "green-500",
	},
	Refused: {
		Value: "REFUSED",
		Label: "Refusée",
		Icon: faTimes,
		Color: "red-500",
	},
	Cancelled: {
		Value: "CANCELLED",
		Label: "Annulée",
		Icon: faTimes,
		Color: "gray-600",
	},
	Withdrawned: {
		Value: "WITHDRAWNED",
		Label: "Annulée",
		Icon: faTimes,
		Color: "gray-600",
	},
	Expired: {
		Value: "EXPIRED",
		Label: "Expirée",
		Icon: faTimes,
		Color: "gray-600",
	},
	None: {
		Value: "NONE",
		Label: "Inconnue",
		Icon: faQuestion,
		Color: "black-400",
	}
};

let PurchaseOrderStatusKind = {
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

Object.keys(enums).map(key => PurchaseOrderStatusKind[key] = enums[key]);
Object.freeze(PurchaseOrderStatusKind);

export default PurchaseOrderStatusKind;
