import { getDefaultFields } from "../../stores/form";
import omit from "lodash/omit";

export const initialValues = {
	id: null,
	name: null,
	comment: null,
	batches: [],
	products: [],
	saleStartedOn: new Date(),
	saleEndedOn: new Date(),
};

export const validators = (values) => ({
	...getDefaultFields(values, initialValues, ["id"]),
	name: { value: values.name, validators: ["required"], enabled: true },
	comment: { value: values.comment, validators: ["required"], enabled: true },
	products: { value: values.products, validators: ["required"], enabled: true },
	batches: { value: values.batches, validators: ["required"], enabled: false },
	saleStartedOn: { value: values.saleStartedOn, validators: ["required"], enabled: true },
	saleEndedOn: { value: values.saleEndedOn, validators: ["required"], enabled: true },
});

export const normalizeCreateRecall = (recall) =>
	omit(
		{
			...recall,
			productIds: recall.products ? recall.products.map((c) => c.id) : [],
			batchIds: recall.batches ? recall.batches.map((c) => c.id) : [],
		},
		["id", "batches", "products"]
	);

export const normalizeUpdateRecall = (recall) =>
	omit(
		{
			...recall,
			productIds: recall.products ? recall.products.filter((p) => !p.markForDeletion).map((c) => c.id) : [],
			batchIds: recall.batches ? recall.batches.filter((p) => !p.markForDeletion).map((c) => c.id) : [],
		},
		["batches", "products"]
	);
