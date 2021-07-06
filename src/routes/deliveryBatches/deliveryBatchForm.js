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

export const denormalizeDeliveryBatchProducts = products => {
	let newProducts = [];
	products.forEach((p) => {
		let product;

		if (newProducts.length > 0) {
			product = newProducts.find((_product) => _product.productId == p.productId);
		}

		if (!product) {
			product = p;
			product.productsToDeliver = 0;
			product.productsBroken = 0;
			product.productsMissing = 0;
			product.productsInExcess = 0;
			newProducts = [...newProducts, product];
		}

		switch (p.kind) {
			case ModificationKind.ToDeliver.Value:
				product.productsToDeliver = p.quantity;
				break;
			case ModificationKind.Broken.Value:
				product.productsBroken = p.quantity;
				break;
			case ModificationKind.Missing.Value:
				product.productsMissing = p.quantity;
				break;
			case ModificationKind.Excess.Value:
				product.productsInExcess = p.quantity;
				break;
		}
	})

	return newProducts;
}