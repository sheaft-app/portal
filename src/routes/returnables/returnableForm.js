import omit from "lodash/omit";

import { getDefaultFields } from "../../stores/form";

export const initialValues = {
	name: "",
	vat: null,
	wholeSalePrice: null,
	description: "",
	noVat: false,
};

export const validators = (values) => ({
	...getDefaultFields(values, initialValues, ["description", "noVat"]),
	name: { value: values.name, validators: ["required", "minLength:3"], enabled: true },
	wholeSalePrice: { value: values.wholeSalePrice, validators: ["required", "min:0.01"], enabled: true },
});

export const normalizeReturnable = (returnable) =>
	omit(
		{
			...returnable,
			vat: returnable.noVat ? 0 : returnable.vat,
		},
		["noVat"]
	);
