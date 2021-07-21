import { getDefaultFields } from "../../stores/form";
import omit from "lodash/omit";

export const initialValues = {
	name: null,
	description: null,
	products: [],
};

export const validators = (values) => ({
	...getDefaultFields(values, initialValues, ["description", "isDefault"]),
	name: { value: values.name, validators: ["required"], enabled: true },
});

export const normalizeCreateQuickOrder = (quickOrder) =>
	omit(
		{
			...quickOrder,
			products: quickOrder.products ? quickOrder.products.map((c) => ({ id: c.id, quantity: c.quantity })) : [],
		},
		["isDefault"]
	);

export const normalizeUpdateQuickOrder = (quickOrder) =>
	omit(
		{
			...quickOrder,
			products: quickOrder.products ? quickOrder.products.map((c) => ({ id: c.id, quantity: c.quantity })) : [],
		},
		["isDefault"]
	);
