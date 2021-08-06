import omit from "lodash/omit";

import { getDefaultFields } from "../../stores/form";

export const initialValues = {
	id: null,
	name: null,
	isDefault: false,
	description: null,
	products: [],
};

export const validators = (values) => ({
	...getDefaultFields(values, initialValues, ["description", "id"]),
	name: { value: values.name, validators: ["required"], enabled: true },
	isDefault: { value: values.isDefault, validators: ["required"], enabled: true },
	products: { value: values.products, validators: ["required"], enabled: false },
});

export const normalizeCreateQuickOrder = (quickOrder) =>
	omit(
		{
			...quickOrder,
			products: quickOrder.products
				? quickOrder.products.map((c) => ({ id: c.id, quantity: c.quantity == 0 ? null : c.quantity }))
				: [],
		},
		["id", "isDefault"]
	);

export const normalizeUpdateQuickOrder = (quickOrder) =>
	omit(
		{
			...quickOrder,
			products: quickOrder.products
				? quickOrder.products
						.filter((p) => !p.markForDeletion)
						.map((c) => ({ id: c.id, quantity: c.quantity == 0 ? null : c.quantity }))
				: [],
		},
		[]
	);
