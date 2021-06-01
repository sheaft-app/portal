import { getDefaultFields } from "../../stores/form";
import ConditioningKind from "../../enums/ConditioningKind";
import omit from "lodash/omit";

export const initialValues = {
	reference: null,
	unit: null,
	quantityPerUnit: null,
	vat: null,
	name: null,
	conditioning: ConditioningKind.Bulk.Value,
	returnableId: null,
	description: null,
	tags: [],
	available: true,
	catalogs: [],
	pictures: [],
	producer: {
		notSubjectToVat: false,
	},
};

export const validators = (product) => ({
	...getDefaultFields(product, initialValues, [
		"pictures",
		"catalogs",
		"reference",
		"returnableId",
		"description",
		"picture",
	]),
	name: {
		value: product.name,
		validators: ["required", "minLength:3"],
		enabled: true,
	},
	vat: { value: product.vat, validators: ["required"], enabled: !product.notSubjectToVat },
	unit: {
		value: product.unit,
		validators: ["required"],
		enabled: product.conditioning == ConditioningKind.Bulk.Value,
	},
	quantityPerUnit: {
		value: product.quantityPerUnit,
		validators: ["required", "min:0.01"],
		enabled:
			product.conditioning !== ConditioningKind.Bunch.Value && product.conditioning !== ConditioningKind.Bouquet.Value,
	},
});

export const normalizeCreateProduct = (product) =>
	omit(
		{
			...product,
			returnableId: product.returnable ? product.returnable.id : null,
			catalogs: product.catalogs
				? product.catalogs.map((c) => ({
						id: c.id,
						wholeSalePricePerUnit: c.wholeSalePricePerUnit,
				  }))
				: [],
			pictures: product.pictures
				? product.pictures.map((p) => ({ id: p.new ? null : p.id, data: p.new ? p.data : null, position: p.position }))
				: [],
			tags: product.tags.map((i) => i.id),
		},
		["producer", "createdOn", "rating", "ratingsCount", "returnable", "weight"]
	);

export const normalizeUpdateProduct = (product) => ({
	...normalizeCreateProduct(product),
	catalogs: product.catalogs
		? product.catalogs
				.filter((c) => !c.markForDeletion)
				.map((c) => ({
					id: c.id,
					wholeSalePricePerUnit: c.wholeSalePricePerUnit,
				}))
		: [],
});
