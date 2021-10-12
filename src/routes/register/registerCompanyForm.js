import formatISO from "date-fns/formatISO";

import { writable, get } from "svelte/store";

import omit from "lodash/omit";

import RegistrationKind from "../../enums/RegistrationKind";
import { normalizeOpeningHours, getDefaultDenormalizedOpeningHours } from "../../helpers/app";
import { getDefaultFields } from "../../stores/form";

export const siret = writable(null);

export const companyInitialValues = {
	name: null,
	commercialName: null,
	vatIdentifier: null,
	kind: null,
	notSubjectToVat: false,
	differentBillingAddress: false,
	email: null, //$authUserAccount?.profile?.email ||
	phone: null, // $authUserAccount?.profile?.phone
	address: {
		line1: null,
		line2: null,
		city: null,
		zipcode: null,
		country: "FR",
	},
	billing: {
		name: null,
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
	city: { value: values.address.city, validators: ["required"], enabled: true },
	zipcode: { value: values.address.zipcode, validators: ["required"], enabled: true },
	line1: { value: values.address.line1, validators: ["required"], enabled: true },
	billingCity: { value: values.billing.city, validators: ["required"], enabled: values.differentBillingAddress },
	billingZipcode: { value: values.billing.zipcode, validators: ["required"], enabled: values.differentBillingAddress },
	billingLine1: { value: values.billing.line1, validators: ["required"], enabled: values.differentBillingAddress },
	billingName: { value: values.billing.name, validators: ["required"], enabled: values.differentBillingAddress },
});

export const normalizeCompany = (profile) => {
	let ownerInfos = get(owner);
	let companyInfos = get(company);

	const dateParts = ownerInfos?.birthDate?.trim()?.split("/") || null;

	return {
		openForNewBusiness: get(openForBusiness),
		sponsoringCode: get(sponsor),
		firstName: ownerInfos.firstName,
		lastName: ownerInfos.lastName,
		name: companyInfos.commercialName,
		email: ownerInfos.email,
		notSubjectToVat: companyInfos.notSubjectToVat,
		phone: companyInfos.phone,
		picture: profile.picture || null,
		address: { ...omit(get(productionSite).address, ["insee", "id"]), country: "FR" },
		legals: {
			...omit(companyInfos, ["commercialName", "notSubjectToVat", "phone", "differentBillingAddress"]),
			siret: get(siret).toString(),
			address: companyInfos.address ? {
				...companyInfos.address,
				country: companyInfos.address?.country?.code || (companyInfos.address?.country ?? "FR"),
			} : null,
			billing: companyInfos.differentBillingAddress ? {
				...companyInfos.billing,
				country: companyInfos.billing?.country?.code || (companyInfos.billing?.country ?? "FR")
			} : null,
			vatIdentifier:
				companyInfos.vatIdentifier && !companyInfos.notSubjectToVat
					? "FR" + companyInfos.vatIdentifier + get(siret).toString().substring(0, 9)
					: null,
			owner: {
				...omit(ownerInfos, ["phone"]),
				address: ownerInfos.address ? {
					...ownerInfos.address,
					country: ownerInfos.address?.country?.code || (ownerInfos.address?.country ?? "FR"),
				} : null,
				countryOfResidence: ownerInfos.address?.country?.code || null,
				nationality: ownerInfos.nationality?.code || null,
				birthDate: dateParts ? formatISO(new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])) : null,
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
