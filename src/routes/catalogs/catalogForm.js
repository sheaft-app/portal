import { getDefaultFields } from "../../stores/form";
import { products } from "./stores";
import { get } from "svelte/store";

export const initialValues = {
	available: true,
	isDefault: false,
	name: "",
	products: [],
};

export const validators = (catalog) => ({
	...getDefaultFields(catalog, initialValues, ["products"]),
	name: { value: catalog.name, validators: ["required", "minLength:3"], enabled: true },
});

export const normalizeCatalog = (catalog) => ({
	...catalog,
	products: get(products)
		.filter((p) => !p.markForDeletion)
		.map((p) => ({
			id: p.id,
			wholeSalePricePerUnit: p.wholeSalePricePerUnit,
		})),
});
