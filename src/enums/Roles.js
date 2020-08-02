import GetEnumObjectFor from './helpers.js';

let enums = {
    Owner : { Value: "OWNER", Label: "Propriétaire"},
    Store : { Value: "STORE", Label: "Commerce", Id : "f81030de-18db-40d1-8ed2-4c98ccb70a99"},
    Producer : { Value: "PRODUCER", Label: "Producteur", Id : "e4a370fe-659b-47a8-a1d4-d5d6600abe7d"},
    Consumer : { Value: "CONSUMER", Label: "Consommateur"},
	Anonymous: { Value: "ANONYMOUS", Label: "Anonyme"},
	Registered: {Value: "REGISTERED", Label: "Enregistré"}
}

let Roles = {	
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

Object.keys(enums).map(key => Roles[key] = enums[key]);
Object.freeze(Roles);

export default Roles;