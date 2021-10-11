import { config } from "./../configs/config";

import GetEnumObjectFor from "./helpers.js";

let enums = {
	Admin: { Value: config.roles.admin.value, Label: config.roles.admin.label, Id: config.roles.admin.id },
	Support: { Value: config.roles.support.value, Label: config.roles.support.label, Id: config.roles.support.id },
	Owner: { Value: config.roles.owner.value, Label: config.roles.owner.label, Id: config.roles.owner.id },
	Store: { Value: config.roles.store.value, Label: config.roles.store.label, Id: config.roles.store.id },
	Producer: { Value: config.roles.producer.value, Label: config.roles.producer.label, Id: config.roles.producer.id },
	Consumer: { Value: config.roles.consumer.value, Label: config.roles.consumer.label, Id: config.roles.consumer.id },
	Anonymous: { Value: config.roles.anonymous.value, Label: config.roles.anonymous.label, Id: config.roles.anonymous.id },
	Registered: { Value: config.roles.registered.value, Label: config.roles.registered.label, Id: config.roles.registered.id },
};

let Roles = {
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

Object.keys(enums).map((key) => (Roles[key] = enums[key]));
Object.freeze(Roles);

export default Roles;
