import { getDefaultFields } from "../../stores/form";

export const initialValues = {
	name: "",
	scheduledOn: new Date(),
};

export const validators = (delivery) => ({
	...getDefaultFields(delivery, initialValues, []),
});

export const denormalizeProduct = (products, productsPrepared) => {
	let product = {};

	product["id"] = products[0].productId;
	product["name"] = products[0].name;
	product["completed"] = true;
	product["total"] = products.reduce((acc, curr) => {
		acc += curr.quantity;
		return acc;
	}, 0);
	product["clients"] = products.map((p) => ({
		name: p.purchaseOrder.sender.name,
		purchaseOrderId: p.purchaseOrder.id,
		expected: p.quantity,
		prepared: 0,
	}));
	product["prepared"] = 0;

	if (productsPrepared && productsPrepared.length) {
		productsPrepared.forEach((p) => {
			let p2 = product.clients.find((c) => c.purchaseOrderId == p.purchaseOrder.id);

			if (p2) {
				p2.prepared = p.quantity;
				product["prepared"] += p.quantity;
			}

			if (!p.completed) product["completed"] = false;
		});
	} else {
		product["completed"] = false;
	}

	return product;
};

export const denormalizePickingProducts = (products, productsPrepared) =>
	products.reduce((acc, curr) => {
		if (!acc.find((p) => p.id == curr.productId)) {
			acc = [
				...acc,
				denormalizeProduct(
					products.filter((p) => p.productId == curr.productId),
					productsPrepared.filter((p) => p.productId == curr.productId)
				),
			];
		}

		return acc;
	}, []);
