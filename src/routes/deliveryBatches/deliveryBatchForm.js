import { getDefaultFields } from "../../stores/form";
import { timeSpanToTime } from "../../helpers/app";
import ModificationKind from "../../enums/ModificationKind";
import omit from "lodash/omit";

export const initialValues = {
	name: "",
	scheduledOn: new Date(),
};

export const validators = (delivery) => ({
	...getDefaultFields(delivery, initialValues, []),
});

export const normalizeDeliveryBatch = (delivery) => ({
	id: delivery.id,
	name: delivery.name,
	deliveries: delivery.deliveries.map((o, index) => ({
		clientId: o.clientId,
		position: index,
		purchaseOrderIds: o.purchaseOrders.map((p) => p.id),
	})),
});

export const denormalizeDeliveryBatch = (delivery) => ({
	...delivery,
	deliveries: delivery.deliveries.sort((a, b) => a.position - b.position),
	from: timeSpanToTime(delivery.from),
	scheduledOn: new Date(delivery.scheduledOn),
});

export const denormalizeDeliveryBatchProducts = (products) =>
	products.reduce((acc, curr) => {
		let product;

		if (acc.length > 0) {
			product = acc.find((_product) => _product.productId == curr.productId);
		}

		if (!product) {
			product = curr;
			product.productsToDeliver = 0;
			product.productsBroken = 0;
			product.productsMissing = 0;
			product.productsInExcess = 0;
			acc = [...acc, product];
		}

		switch (curr.kind) {
			case ModificationKind.ToDeliver.Value:
				product.productsToDeliver = curr.quantity;
				break;
			case ModificationKind.Broken.Value:
				product.productsBroken = curr.quantity;
				break;
			case ModificationKind.Missing.Value:
				product.productsMissing = curr.quantity;
				break;
			case ModificationKind.Excess.Value:
				product.productsInExcess = curr.quantity;
				break;
		}

		return acc;
	}, []);
