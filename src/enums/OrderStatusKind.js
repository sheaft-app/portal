import {
	faQuestion,
	faHourglass,
	faThumbsUp,
	faCircleNotch,
	faThumbsDown,
	faCheck,
	faTimes,
	faSpinner,
	faTruck,
	faTruckLoading
} from "@fortawesome/free-solid-svg-icons";
import GetEnumObjectFor from './helpers.js';

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
		Icon: faThumbsDown,
		Color: "red-500",
	},
	Cancelled: {
		Value: "CANCELLED",
		Label: "Annulée",
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

let OrderStatusKind = {	
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

Object.keys(enums).map(key => OrderStatusKind[key] = enums[key]);
Object.freeze(OrderStatusKind);

export default OrderStatusKind;
