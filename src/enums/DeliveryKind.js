import GetEnumObjectFor from "./helpers.js";

let enums = {
	Farm: { Value: "FARM", Label: "Site de production" },
	Market: { Value: "MARKET", Label: "Au marché" },
	Collective: { Value: "COLLECTIVE", Label: "Magasin de producteurs" },
	Withdrawal: { Value: "WITHDRAWAL", Label: "Point retrait" },
	ProducerToStore: { Value: "PRODUCER_TO_STORE", Label: "Livraison au magasin" },
	ExternalToStore: { Value: "EXTERNAL_TO_STORE", Label: "Prestataire aux Magasins" },
	ProducerToConsumer: { Value: "PRODUCER_TO_CONSUMER", Label: "Producteur aux Consommateurs" },
	ExternalToConsumer: { Value: "EXTERNAL_TO_CONSUMER", Label: "Prestataire aux Consommateurs" },
};

let DeliveryKind = {
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

Object.keys(enums).map((key) => (DeliveryKind[key] = enums[key]));
Object.freeze(DeliveryKind);

export default DeliveryKind;
