import GetEnumObjectFor from './helpers.js';

let enums = {
	WaitingForProducerApproval: { Value: "WAITING_FOR_PRODUCER_APPROVAL", Label: "En attente d'acceptation du producteur"},
	WaitingForStoreApproval: { Value: "WAITING_FOR_STORE_APPROVAL", Label: "En attente d'acceptation du magasin"},
	Refused: { Value: "REFUSED", Label: "Refusé"},
	Cancelled: { Value: "CANCELLED", Label: "Annulé"},
	Accepted: { Value: "ACCEPTED", Label: "Accepté"},
};

let AgreementStatusKind = {	
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

Object.keys(enums).map(key => AgreementStatusKind[key] = enums[key]);
Object.freeze(AgreementStatusKind);

export default AgreementStatusKind;