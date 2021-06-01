import formatISO from "date-fns/formatISO";

export const normalizeCreateLegals = (user) => {
	const dateParts = user.birthDate.trim().split("/");

	return {
		...user,
		address: { ...user.address, country: user.address.country.code },
		countryOfResidence: user.countryOfResidence.code,
		nationality: user.nationality.code,
		birthDate: formatISO(new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])),
	};
};

export const normalizeUpdateLegals = ({ user, id }) => ({
	...normalizeCreateLegals(user),
	id,
});
