import { getDefaultFields } from "../../stores/form";

export const initialValues = {
	name: "",
	scheduledOn: new Date(),
};

export const validators = (delivery) => ({
	...getDefaultFields(delivery, initialValues, []),
});

export const denormalizeProduct = () => {}; // todo remove

export const denormalizeProducts = (products, productsPrepared) => {
	let _products = [];
	
	products.map(p => {
		let foundProduct = true;
		let product = _products.find(p2 => p2?.id == p?.productId);

		if (!product) {
			foundProduct = false;
			product = {};
		}

		product["id"] = p.productId;
		product["name"] = p.name;
		product["completed"] = true;
		product["total"] = (product?.total || 0) + p.quantity;
		product["clients"] = [...(product?.clients || []), {
			name: p.purchaseOrder.sender.name,
			purchaseOrderId: p.purchaseOrder.id,
			expected: p.quantity,
			prepared: 0,
		}];
		product["prepared"] = 0;


		let _productsPrepared = productsPrepared?.filter((_p) => _p.productId == p.productId);

		if (_productsPrepared) {
			_productsPrepared.forEach((_p) => {
				let p2 = product.clients.find((c) => c.purchaseOrderId == _p.purchaseOrder.id);

				if (p2) {
					p2.prepared = _p.quantity;
					product["prepared"] += _p.quantity;
					product["selectedBatches"] = _p.batches || [];
				}

				if (!_p.completed) product["completed"] = false;
			});
		} else {
			product["completed"] = false;
		}

		if (!foundProduct) {
			_products = [..._products, product];
		}
	});
	return _products;
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
