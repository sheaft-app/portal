import { faThumbsUp, faTimes, faSpinner, faArchive } from "@fortawesome/free-solid-svg-icons";
import GetEnumObjectFor from "./helpers.js";

export const OrderStatus = {
	CREATED: "CREATED",
	WAITING: "WAITING",
	VALIDATED: "VALIDATED",
	REFUSED: "REFUSED",
	EXPIRED: "EXPIRED",
	ARCHIVED: "ARCHIVED",
};

let enums = {
	Created: {
		Value: "CREATED",
		Label: "Pannier en cours",
		Icon: faSpinner,
		Color: "blue-400",
	},
	Waiting: {
		Value: "WAITING",
		Label: "Validation du paiement",
		Icon: faSpinner,
		Color: "blue-400",
	},
	Validated: {
		Value: "VALIDATED",
		Label: "Paiement accepté",
		Icon: faThumbsUp,
		Color: "green-500",
	},
	Refused: {
		Value: "REFUSED",
		Label: "Paiement refusé",
		Icon: faTimes,
		Color: "red-500",
	},
	Expired: {
		Value: "EXPIRED",
		Label: "Expirée",
		Icon: faTimes,
		Color: "orange-500",
	},
	Archived: {
		Value: "ARCHIVED",
		Label: "Archivée",
		Icon: faArchive,
		Color: "black-400",
	},
};

let OrderStatusKind = {
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

Object.keys(enums).map((key) => (OrderStatusKind[key] = enums[key]));
Object.freeze(OrderStatusKind);

export default OrderStatusKind;
