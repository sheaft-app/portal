import { faThumbsDown, faCheck, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import GetEnumObjectFor from "./helpers.js";

let enums = {
	WaitingForProducerApproval: {
		Value: "WAITING_FOR_PRODUCER_APPROVAL",
		Label: "En attente du producteur",
		Icon: faSpinner,
		Color: "blue-400",
	},
	WaitingForStoreApproval: {
		Value: "WAITING_FOR_STORE_APPROVAL",
		Label: "En attente du magasin",
		Icon: faSpinner,
		Color: "blue-400",
	},
	Refused: {
		Value: "REFUSED",
		Label: "Refusé",
		Icon: faThumbsDown,
		Color: "red-400",
	},
	Cancelled: {
		Value: "CANCELLED",
		Label: "Annulé",
		Icon: faTimes,
		Color: "gray-600",
	},
	Accepted: {
		Value: "ACCEPTED",
		Label: "Accepté",
		Icon: faCheck,
		Color: "green-400",
	},
};

let AgreementStatusKind = {
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

Object.keys(enums).map((key) => (AgreementStatusKind[key] = enums[key]));
Object.freeze(AgreementStatusKind);

export default AgreementStatusKind;
