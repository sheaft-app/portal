import DeliveryStatus from "./../enums/DeliveryStatus";
import ModificationKind from "./../enums/ModificationKind";
import PurchaseOrderStatusKind from "../enums/PurchaseOrderStatusKind";

export const getPurchaseOrdersProductsQuantites = (purchaseOrders) => {
	const products = {
		orderedProducts: [],
		preparedProducts: [],
		orderedReturnables: [],
		preparedReturnables: [],
	};

	purchaseOrders.map((po) => {
		products.orderedProducts = [
			...products.orderedProducts,
			...po.products.map((p) => getProductModel(p))];
		products.orderedReturnables = [
			...products.orderedReturnables,
			...po.products.filter((p) => p.isReturnable).map((p) => getReturnableModel(p)),
		];
		products.preparedProducts = [
			...products.preparedProducts,
			...po.preparedProducts.map((p) => getProductModel(p)),
		];
		products.preparedReturnables = [
			...products.preparedReturnables,
			...po.preparedProducts.filter((p) => p.isReturnable).map((p) => getReturnableModel(p)),
		];
	});

	return products;
};

export const getDeliveryProductsQuantites = (delivery) => {
	const products = {
		deliveredProducts: [],
		deliveredReturnables: [],
		returnedReturnables: delivery.returnedReturnables ? delivery.returnedReturnables.map(r => getReturnableModel(r)) : [],
	};

	denormalizeDeliveryProducts(delivery.products).map((po) => {
		products.deliveredProducts = [
			...products.deliveredProducts,
			getProductModel(po, delivery.status)];
		products.deliveredReturnables = [
			...products.deliveredReturnables,
			po.isReturnable ? getReturnableModel(po, delivery.status) : null];
	});

	return products;
};


export const denormalizeDeliveryProducts = (products) =>
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



const getReturnableModel = (product, deliveryStatus) => {
	return {
		id: product.returnableId ? product.returnableId : product.id,
		vat: product.returnableVat ? product.returnableVat : product.vat,
		name: product.returnableName ? product.returnableName : product.name,
		unitWholeSalePrice: product.returnableWholeSalePrice ? product.returnableWholeSalePrice : product.unitWholeSalePrice,
		quantity: !deliveryStatus ? product.quantity : (deliveryStatus === DeliveryStatus.Delivered.Value ? product.productsToDeliver + product.productsBroken + product.productsMissing + product.productsInExcess : 0),
		kind: product.kind,
	};
};

const getProductModel = (product, deliveryStatus) => {

	console.log(product, deliveryStatus);
	return {
		id: product.productId ? product.productId : product.id,
		vat: product.vat,
		name: product.name,
		unitWholeSalePrice: product.unitWholeSalePrice,
		quantity: !deliveryStatus
			? product.quantity
			: deliveryStatus === DeliveryStatus.Delivered.Value
			? product.productsToDeliver + product.productsBroken + product.productsMissing + product.productsInExcess
			: 0,
		kind: product.kind,
		reference: product.reference,
		isReturnable: product.isReturnable,
		returnableId: product.returnableId,
		batches: product.batches,
	};
};

export const getProductsProgress = (products, returnables, deliveryFees, purchaseOrderStatus) => {
	let model = {
		products: [],
		returnables: [],
		returnedReturnables: [],
		total: {
			wholeSalePrice: 0,
			vatPrice: 0,
			onSalePrice: 0
		},
		deliveryFees: deliveryFees,
	};

	let productsFormatted = formatProducts(
		products.orderedProducts,
		products.preparedProducts,
		products.deliveredProducts,
		purchaseOrderStatus
	);

	let returnablesFormatted = formatReturnables(
		returnables.orderedReturnables,
		returnables.preparedReturnables,
		returnables.deliveredReturnables,
		returnables.returnedReturnables,
		purchaseOrderStatus
	);

	model.products = productsFormatted.products;
	model.returnables = returnablesFormatted.returnables;
	model.returnedReturnables = returnablesFormatted.returnedReturnables;

	model.total.wholeSalePrice += productsFormatted.wholeSalePrice;
	model.total.wholeSalePrice += returnablesFormatted.wholeSalePrice;

	model.total.vatPrice += productsFormatted.vatPrice;
	model.total.vatPrice += returnablesFormatted.vatPrice;

	model.total.onSalePrice += productsFormatted.onSalePrice;
	model.total.onSalePrice += returnablesFormatted.onSalePrice;

	return model;
};

const formatProducts = (orderedProducts, preparedProducts, deliveredProducts, purchaseOrderStatus) => {
	let products = [];
	let total = {
		wholeSalePrice: 0,
		vatPrice: 0,
		onSalePrice: 0,
	};

	products = updateFormattedProducts(products, formatData(orderedProducts), "ordered");
	products = updateFormattedProducts(products, formatData(preparedProducts), "prepared");
	products = updateFormattedProducts(products, formatData(deliveredProducts), "delivered");

	if (products.filter((p) => p.delivered > 0).length > 0) {
		total = getResourcesTotal(products, "delivered");
	} else if (purchaseOrderStatus === PurchaseOrderStatusKind.Completed.Value) {
		total = getResourcesTotal(products, "prepared");
	} else {
		total = getResourcesTotal(products, "ordered");
	}

	return {
		products,
		...total,
	};
};

const getResourcesTotal = (resources, property) => {
	let total = {
		wholeSalePrice: 0,
		vatPrice: 0,
		onSalePrice: 0,
	};

	resources.forEach((r) => {
		r.wholeSalePrice = r[property] * r.unitWholeSalePrice;
		r.vatPrice = r[property] * ((r.unitWholeSalePrice * r.vat) / 100);
		r.onSalePrice = r.wholeSalePrice + r.vatPrice;

		total.wholeSalePrice += r.wholeSalePrice;
		total.vatPrice += r.vatPrice;
		total.onSalePrice += r.onSalePrice;
	});

	return total;
}

const updateFormattedProducts = (model, products, property) => {
	let newProducts = [...model];
	products.data.forEach((product) => {
		let existingProcessedProduct = newProducts.find(
			(processedProduct) => processedProduct.reference === product.reference
		);
		if (!existingProcessedProduct) {
			product[property] = product.quantity;
			product.quantity = null;
			product["ordered"] = product["ordered"] ? product["ordered"] : 0;
			product["prepared"] = product["prepared"] ? product["prepared"] : 0;
			product["delivered"] = product["delivered"] ? product["delivered"] : 0;
			newProducts = [...newProducts, product];
		} else {
			existingProcessedProduct["batches"] = existingProcessedProduct["batches"]
				? existingProcessedProduct["batches"]
				: product["batches"];
			existingProcessedProduct[property] += product.quantity;
		}
	});

	return newProducts;
};

const formatReturnables = (
	orderedReturnables,
	preparedReturnables,
	deliveredReturnables,
	returnedReturnables,
	purchaseOrderStatus
) => {
	let returnables = [];
	let total = {
		wholeSalePrice: 0,
		vatPrice: 0,
		onSalePrice: 0,
	};

	returnables = updateFormattedReturnables(returnables, formatData(orderedReturnables), "ordered");
	returnables = updateFormattedReturnables(returnables, formatData(preparedReturnables), "prepared");
	returnables = updateFormattedReturnables(returnables, formatData(deliveredReturnables), "delivered");

	if (returnables.filter((p) => p.delivered > 0).length > 0) {
		total = getResourcesTotal(returnables, "delivered");
	} else if (purchaseOrderStatus === PurchaseOrderStatusKind.Completed.Value) {
		total = getResourcesTotal(returnables, "prepared");
	} else {
		total = getResourcesTotal(returnables, "ordered");
	}

	let formattedReturnedReturnables = updateFormattedReturnedReturnables(formatData(returnedReturnables));
	total.wholeSalePrice += formattedReturnedReturnables.wholeSalePrice;
	total.vatPrice += formattedReturnedReturnables.vatPrice;
	total.onSalePrice += formattedReturnedReturnables.onSalePrice;

	return {
		returnables,
		returnedReturnables: formattedReturnedReturnables.returnedReturnables,
		...total,
	};
};

const updateFormattedReturnables = (model, returnables, property) => {
	let newReturnables = [...model];
	returnables.data.forEach((returnable) => {
		let existingProcessedReturnable = newReturnables.find(
			(processedReturnable) => processedReturnable.id === returnable.id
		);

		if (!existingProcessedReturnable) {
			returnable["ordered"] = returnable["ordered"] ? returnable["ordered"] : 0;
			returnable["prepared"] = returnable["prepared"] ? returnable["prepared"] : 0;
			returnable["delivered"] = returnable["delivered"] ? returnable["delivered"] : 0;
			returnable[property] = returnable.quantity;
			returnable.quantity = null;
			newReturnables = [...newReturnables, returnable];
		} else {
			existingProcessedReturnable[property] += returnable.quantity;
		}
	});

	return newReturnables;
};

const updateFormattedReturnedReturnables = (returnables) => {
	let newReturnedReturnables = [];
	let total = {
		wholeSalePrice: 0,
		vatPrice: 0,
		onSalePrice: 0,
	};
	
	returnables.data.forEach((returnable) => {
		let existingProcessedReturnable = newReturnedReturnables.find(
			(processedReturnable) => processedReturnable.id === returnable.id
		);

		if (!existingProcessedReturnable) {
			returnable["ordered"] = 0;
			returnable["prepared"] = 0;
			returnable["delivered"] = returnable.quantity;
			returnable.quantity = null;
			newReturnedReturnables = [...newReturnedReturnables, returnable];
		} else {
			existingProcessedReturnable["delivered"] += returnable.quantity;
		}
	});

	newReturnedReturnables.forEach(r => {
		r.wholeSalePrice = r.delivered * r.unitWholeSalePrice;
		r.vatPrice = r.delivered * ((r.unitWholeSalePrice * r.vat) / 100);
		r.onSalePrice = r.wholeSalePrice + r.vatPrice;

		total.wholeSalePrice += r.wholeSalePrice;
		total.vatPrice += r.vatPrice;
		total.onSalePrice += r.onSalePrice;
	});

	return {
		returnedReturnables : newReturnedReturnables,
		...total,
	};
};

const formatData = (data) => {
	let model = {
		data: [],
		wholeSalePrice: 0,
		vatPrice: 0,
		onSalePrice: 0,
	};

	if (!data || data.length < 1) {
		return model;
	}

	let groupedData = [];
	
	data.filter(d => d).forEach((item) => {
		let grouped = groupedData.find(gd => gd.id === item.id);
		if (!grouped) {
			groupedData = [...groupedData, item];
		} else {
			grouped.wholeSalePrice += item.wholeSalePrice;
			grouped.vatPrice += item.vatPrice;
			grouped.onSalePrice += item.onSalePrice;
			grouped.quantity += item.quantity;
		}
	});

	Object.values(groupedData).map((value) => {
		model.wholeSalePrice += value.wholeSalePrice;
		model.vatPrice += value.vatPrice;
		model.onSalePrice += value.onSalePrice;
	});

	model.data = groupedData;

	return model;
};
