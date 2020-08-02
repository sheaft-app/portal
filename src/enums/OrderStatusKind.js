import {
	faQuestion,
	faHourglass,
	faThumbsUp,
	faCircleNotch,
	faCheck,
	faTimes,
	faTruck,
	faTruckLoading,
	faBackspace,
} from "@fortawesome/free-solid-svg-icons";
import GetEnumObjectFor from './helpers.js';

let enums = {
	Waiting: {
		Value: "WAITING",
		Label: "En attente",
		Icon: faHourglass,
		Color: "orange-400",		
	},
	Accepted: {
		Value: "ACCEPTED",
		Label: "Acceptée",
		Icon: faThumbsUp,
		Color: "blue-400",
	},
	Processing: {
		Value: "PROCESSING",
		Label: "En préparation",
		Icon: faCircleNotch,
		Color: "teal-400",
	},
	Completed: {
		Value: "COMPLETED",
		Label: "Prête",
		Icon: faCheck,
		Color: "green-400",
	},
	Shipping: {
		Value: "SHIPPING",
		Label: "En livraison",
		Icon: faTruck,
		Color: "blue-400",
	},
	Delivered: {
		Value: "DELIVERED",
		Label: "Livrée",
		Icon: faTruckLoading,
		Color: "green-400",
	},
	Refused: {
		Value: "REFUSED",
		Label: "Refusée",
		Icon: faTimes,
		Color: "red-400",
	},
	Cancelled: {
		Value: "CANCELLED",
		Label: "Annulée",
		Icon: faBackspace,
		Color: "gray-400",
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
