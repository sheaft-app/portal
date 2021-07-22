import { getDefaultFields } from "../../stores/form";
import formatISO from "date-fns/formatISO";
import { normalizeOpeningHours, getDefaultDenormalizedOpeningHours } from "../../helpers/app";
import { writable, get } from "svelte/store";
import omit from "lodash/omit";
import RegistrationKind from "../../enums/RegistrationKind";

export const siret = writable(null);

export const companyInitialValues = {
	name: null,
	commercialName: null,
	vatIdentifier: null,
	kind: null,
	notSubjectToVat: false,
	email: null, //$authUserAccount?.profile?.email ||
	phone: null, // $authUserAccount?.profile?.phone
	address: {
		line1: null,
		line2: null,
		city: null,
		zipcode: null,
		country: "FR",
	},
	registrationKind: null,
	registrationCode: null,
	registrationCity: null,
};
export const company = writable({ ...companyInitialValues });

export const owner = writable({
	firstName: null, // $authUserAccount?.profile?.given_name
	lastName: null, // $authUserAccount?.profile?.family_name
	email: null, // $authUserAccount?.profile?.email ||
	birthDate: null,
	nationality: null,
	address: {
		line1: null,
		line2: null,
		city: null,
		zipcode: null,
		country: "FR",
	},
});

export const productionSite = writable({
	address: {
		line1: null,
		line2: null,
		city: null,
		zipcode: null,
		country: "FR",
	},
});

export const openForBusiness = writable(true);
export const businessHours = writable(getDefaultDenormalizedOpeningHours());
export const sponsor = writable(JSON.parse(localStorage.getItem("user_sponsoring")) || null);
export const stepper = writable(0);

export const companyValidators = (values) => ({
	...getDefaultFields(values, companyInitialValues, []),
	vatIdentifier: { value: values.vatIdentifier, validators: ["required"], enabled: !values.notSubjectToVat },
	email: { value: values.email, validators: ["required", "email"], enabled: true },
	registrationCode: {
		value: values.registrationCode,
		validators: ["required"],
		enabled: values.registrationKind === RegistrationKind.RM.Value,
	},
	registrationCity: {
		value: values.registrationCity,
		validators: ["required"],
		enabled: values.registrationKind === RegistrationKind.RCS.Value,
	},
});

export const normalizeCompany = (profile) => {
	const dateParts = get(owner).birthDate.trim().split("/");

	return {
		openForNewBusiness: get(openForBusiness),
		sponsoringCode: get(sponsor),
		firstName: profile.given_name || null,
		lastName: profile.family_name || null,
		name: get(company).commercialName,
		email: profile.email || null,
		notSubjectToVat: get(company).notSubjectToVat,
		phone: get(company).phone,
		picture: profile.picture || null,
		address: { ...omit(get(productionSite).address, ["insee", "id"]), country: "FR" },
		legals: {
			...omit(get(company), ["commercialName", "notSubjectToVat", "phone"]),
			siret: get(siret).toString(),
			address: {
				...get(company).address,
				country: get(company).address.country.code,
			},
			vatIdentifier:
				get(company).vatIdentifier && !get(company).notSubjectToVat
					? "FR" + get(company).vatIdentifier + get(siret).toString().substring(0, 9)
					: null,
			owner: {
				...get(owner),
				address: {
					...get(owner).address,
					country: get(owner).address.country.code,
				},
				countryOfResidence: get(owner).address.country.code,
				nationality: get(owner).nationality.code,
				birthDate: formatISO(new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])),
			},
		},
	};
};

export const normalizeStore = (profile) =>
	omit(
		{
			...normalizeCompany(profile),
			openingHours: normalizeOpeningHours(get(businessHours)),
		},
		["notSubjectToVat"]
	);
