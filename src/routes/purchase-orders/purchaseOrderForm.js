import omit from "lodash/omit";

import { getDefaultFields } from "../../stores/form";

export const initialValues = {
	client: null,
	expectedDeliveryDate: new Date(),
	from: 8,
	to: 19,
	products: [],
	comment: null,
	skipNotification: false,
};

export const validators = (values) => ({
	...getDefaultFields(values, initialValues, ["comment"]),
	from: { value: values.from, validators: ["required"], enabled: true },
	to: { value: values.to, validators: ["required"], enabled: true },
	products: { value: values.products, validators: ["required"], enabled: false },
	client: { value: values.client, validators: ["required"], enabled: true },
	expectedDeliveryDate: { value: values.expectedDeliveryDate, validators: ["required"], enabled: true },
});

export const normalizeCreatePurchaseOrder = (purchaseOrder) =>
	omit(
		{
			...purchaseOrder,
			storeId: purchaseOrder.client.id,
			deliveryModeId: purchaseOrder.client.deliveryMode.id,
			from: `PT${purchaseOrder.from}H`,
			to: `PT${purchaseOrder.to}H`,
			products: purchaseOrder.products
				? purchaseOrder.products.map((c) => ({ id: c.id, quantity: c.quantity }))
				: [],
		},
		["client"]
	);
