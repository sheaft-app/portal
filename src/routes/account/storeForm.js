import { getDefaultFields } from "../../stores/form";
import { getDefaultDenormalizedOpeningHours, normalizeOpeningHours } from "./../../helpers/app";
import omit from "lodash/omit";

export const initialValues = {
	id: null,
	name: null,
	firstName: null,
	lastName: null,
	email: null,
	phone: null,
	summary: "",
	description: "",
	facebook: null,
	instagram: null,
	website: null,
	address: {
		line1: null,
		line2: null,
		city: null,
		zipcode: null,
		country: "FR",
	},
	pictures: [],
	openingHours: getDefaultDenormalizedOpeningHours(),
	openForNewBusiness: true,
};

export const validators = (store) => ({
	...getDefaultFields(store, initialValues, ["facebook", "instagram", "website", "phone", "pictures"]),
	openingHours: {
		value: store.openingHours,
		validators: ["required", "openingsDays", "openingsDates"],
		enabled: store.openForNewBusiness,
	},
	summary: { value: store.summary, validators: ["maxLength:300"], enabled: store.summary && store.summary.length > 0 },
	description: {
		value: store.description,
		validators: ["maxLength:1500"],
		enabled: store.description && store.description.length > 0,
	},
});

export const normalizeStore = (store) => ({
	...store,
	pictures: store.pictures.map((p) => ({ id: p.new ? null : p.id, data: p.new ? p.data : null, position: p.position })),
	tags: store.tags ? store.tags.map((t) => t.id) : [],
	openingHours: store.openingHours ? normalizeOpeningHours(store.openingHours) : [],
});
