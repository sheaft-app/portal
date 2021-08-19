import { denormalizeDeliveryBatchProducts } from "../routes/delivery-batches/deliveryBatchForm";

export const getPurchaseOrderModel = (products, returnedReturnables, deliveryFeesWholeSalePrice, deliveryFeesVatPrice, deliveryFeesOnSalePrice) => {
	let returnablesGroupedToBill = {};
	let model = {
		products: [],
		returnables: [],
		totalWholeSalePrice: 0,
		totalVatPrice: 0,
		totalOnSalePrice: 0,
		deliveryFeesWholeSalePrice: deliveryFeesWholeSalePrice ? deliveryFeesWholeSalePrice : 0,
		deliveryFeesVatPrice: deliveryFeesVatPrice ? deliveryFeesVatPrice : 0,
		deliveryFeesOnSalePrice: deliveryFeesOnSalePrice ? deliveryFeesOnSalePrice : 0,
	};

	const accumulateProps = (obj, reference, propName) => {
		if (obj.id == reference.id) {
			return obj;
		}

		const props = ["quantity", `${propName}WholeSalePrice`, `${propName}OnSalePrice`, `${propName}VatPrice`];
		props.map((prop) => (obj[prop] += reference[prop]));

		return obj;
	};

	if (products) {
		const productsGroupedToBill = products.reduce((allProducts, product) => {
			const productDeliveryData = denormalizeDeliveryBatchProducts(
				products.filter((p) => p.productId == product.productId)
			).shift();

			allProducts[product.productId] = {
				...productDeliveryData,
				...accumulateProps(allProducts[product.productId] || product, product, "totalProduct"),
			};

			if (!product.isReturnable) return allProducts;

			returnablesGroupedToBill[`${product.returnableId}_deposed`] = accumulateProps(
				returnablesGroupedToBill[`${product.returnableId}_deposed`] || {
					id: product.returnableId,
					name: `${product.returnableName} (Consignes déposées)`,
					totalWholeSalePrice: product.totalReturnableWholeSalePrice,
					totalVatPrice: product.totalReturnableVatPrice,
					totalOnSalePrice: product.totalReturnableOnSalePrice,
					quantity: product.quantity,
				},
				product,
				"totalReturnable"
			);

			return allProducts;
		}, {});

		Object.values(productsGroupedToBill).map((value) => {
			model.totalWholeSalePrice += value.totalProductWholeSalePrice;
			model.totalVatPrice += value.totalProductVatPrice;
			model.totalOnSalePrice += value.totalProductOnSalePrice;
			model.products = [...model.products, value];
		});
	}

	if (returnedReturnables) {
		returnablesGroupedToBill = returnedReturnables.reduce((returnables, returnable) => {
			returnables[`${returnable.id}_retrieved`] = accumulateProps(
				returnables[`${returnable.id}_retrieved`] || {
					name: `${returnable.name} (Consignes récupérées)`,
					...returnable,
				},
				returnable,
				"total"
			);

			return returnables;
		}, {});

		Object.values(returnablesGroupedToBill).map((value) => {
			model.totalWholeSalePrice += value.totalWholeSalePrice;
			model.totalVatPrice += value.totalVatPrice;
			model.totalOnSalePrice += value.totalOnSalePrice;
			model.returnables = [...model.returnables, value];
		});
	}

	model.totalWholeSalePrice += model.deliveryFeesWholeSalePrice;
	model.totalVatPrice += model.deliveryFeesVatPrice;
	model.totalOnSalePrice += model.deliveryFeesOnSalePrice;

	return model;
};
