import GetEnumObjectFor from './helpers.js';

let enums = {
	Farm: { Value: "FARM", Label: "A la ferme"},
	Market: { Value: "MARKET", Label: "Au marché"},
	Collective: { Value: "COLLECTIVE", Label: "Magasin de producteurs"},
	Withdrawal: { Value: "WITHDRAWAL", Label: "Point retrais"},
	ProducerToStore: { Value: "PRODUCER_TO_STORE", Label: "Producteur aux Magasins"},
	ExternalToStore: { Value: "EXTERNAL_TO_STORE", Label: "Prestataire aux Magasins"},
	ProducerToConsumer: { Value: "PRODUCER_TO_CONSUMER", Label: "Producteur aux Consommateurs"},
	ExternalToConsumer: { Value: "EXTERNAL_TO_CONSUMER", Label: "Prestataire aux Consommateurs"},
};

let DeliveryKind = {	
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

Object.keys(enums).map(key => DeliveryKind[key] = enums[key]);
Object.freeze(DeliveryKind);

export default DeliveryKind;