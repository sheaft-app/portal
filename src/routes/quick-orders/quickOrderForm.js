import { getDefaultFields } from "../../stores/form";
import omit from "lodash/omit";

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
	products: { value: values.products, validators: ["required"], enabled: true },
});

export const normalizeCreateQuickOrder = (quickOrder) =>
	omit(
		{
			...quickOrder,
			products: quickOrder.products ? quickOrder.products.map((c) => ({ id: c.id, quantity: c.quantity })) : [],
		},
		["id", "isDefault"]
	);

export const normalizeUpdateQuickOrder = (quickOrder) =>
	omit(
		{
			...quickOrder,
			products: quickOrder.products
				? quickOrder.products.filter((p) => !p.markForDeletion).map((c) => ({ id: c.id, quantity: c.quantity }))
				: [],
		},
		[]
	);
