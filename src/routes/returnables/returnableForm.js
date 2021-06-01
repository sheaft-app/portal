import { getDefaultFields } from "../../stores/form";

export const initialValues = {
	name: "",
	vat: null,
	wholeSalePrice: null,
	description: "",
};

export const validators = (values) => ({
	...getDefaultFields(values, initialValues, ["description"]),
	name: { value: values.name, validators: ["required", "minLength:3"], enabled: true },
	wholeSalePrice: { value: values.wholeSalePrice, validators: ["required", "min:0.01"], enabled: true },
});
