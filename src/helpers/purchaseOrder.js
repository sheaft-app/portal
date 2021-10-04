import ModificationKind from "./../enums/ModificationKind";
import DeliveryStatus from "./../enums/DeliveryStatus";

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
		quantity: !deliveryStatus ? product.quantity : (deliveryStatus === DeliveryStatus.Delivered.Value ? product.quantity + product.productsBroken + product.productsMissing + product.productsInExcess : 0),
		kind: product.kind,
	};
};

const getProductModel = (product, deliveryStatus) => {
	return {
		id: product.productId ? product.productId : product.id,
		vat: product.vat,
		name: product.name,
		unitWholeSalePrice: product.unitWholeSalePrice,
		quantity: !deliveryStatus ? product.quantity : (deliveryStatus === DeliveryStatus.Delivered.Value ? product.quantity + product.productsBroken + product.productsMissing + product.productsInExcess : 0),
		kind: product.kind,
		reference: product.reference,
		isReturnable: product.isReturnable,
		returnableId: product.returnableId,
	};
};

export const getPurchaseOrderModel = (products, returnables, deliveryFees) => {
	let model = {
		products: [],
		returnables: [],
		returnedReturnables: [],
		totalWholeSalePrice: 0,
		totalVatPrice: 0,
		totalOnSalePrice: 0,
		deliveryFees: deliveryFees,
	};

	let productsFormatted = formatProducts(
		products.orderedProducts,
		products.preparedProducts,
		products.deliveredProducts
	);

	let returnablesFormatted = formatReturnables(
		returnables.orderedReturnables,
		returnables.preparedReturnables,
		returnables.deliveredReturnables,
		returnables.returnedReturnables
	);

	model.products = productsFormatted.products;
	model.returnables = returnablesFormatted.returnables;
	model.returnedReturnables = returnablesFormatted.returnedReturnables;

	model.totalWholeSalePrice += productsFormatted.totalWholeSalePrice;
	model.totalWholeSalePrice += returnablesFormatted.totalWholeSalePrice;

	model.totalVatPrice += productsFormatted.totalVatPrice;
	model.totalVatPrice += returnablesFormatted.totalVatPrice;

	model.totalOnSalePrice += productsFormatted.totalOnSalePrice;
	model.totalOnSalePrice += returnablesFormatted.totalOnSalePrice;

	return model;
};

const formatProducts = (orderedProducts, preparedProducts, deliveredProducts) => {
	let products = [];
	let total = {
		totalWholeSalePrice: 0,
		totalVatPrice: 0,
		totalOnSalePrice: 0,
	};

	products = updateFormattedProducts(products, formatData(orderedProducts), "ordered");
	products = updateFormattedProducts(products, formatData(preparedProducts), "prepared");
	products = updateFormattedProducts(products, formatData(deliveredProducts), "delivered");

	if (products.filter(p => p.delivered > 0).length > 0) {
		total = getResourcesTotal(products, "delivered");
	}
	else if (products.filter((p) => p.prepared > 0).length > 0) {
		total = getResourcesTotal(products, "prepared");
	}
	else {
		total = getResourcesTotal(products, "ordered");
	}

	return {
		products,
		...total
	};
};

const getResourcesTotal = (resources, property) => {
	let total = {
		totalWholeSalePrice: 0,
		totalVatPrice: 0,
		totalOnSalePrice: 0,
	};

	resources.forEach((r) => {
		r.totalWholeSalePrice = r[property] * r.unitWholeSalePrice;
		r.totalVatPrice = r[property] * ((r.unitWholeSalePrice * r.vat) / 100);
		r.totalOnSalePrice = r.totalWholeSalePrice + r.totalVatPrice;

		total.totalWholeSalePrice += r.totalWholeSalePrice;
		total.totalVatPrice += r.totalVatPrice;
		total.totalOnSalePrice += r.totalOnSalePrice;
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
			product["ordered"] = product["ordered"] ? product["ordered"] : 0;
			product["prepared"] = product["prepared"] ? product["prepared"] : 0;
			product["delivered"] = product["delivered"] ? product["delivered"] : 0;
			product[property] = product.quantity;
			product.quantity = null;
			newProducts = [...newProducts, product];
		} else {
			existingProcessedProduct[property] += product.quantity;
		}
	});

	return newProducts;
};

const formatReturnables = (orderedReturnables, preparedReturnables, deliveredReturnables, returnedReturnables) => {
	let returnables = [];
	let total = {
		totalWholeSalePrice: 0,
		totalVatPrice: 0,
		totalOnSalePrice: 0,
	};

	returnables = updateFormattedReturnables(returnables, formatData(orderedReturnables), "ordered");
	returnables = updateFormattedReturnables(returnables, formatData(preparedReturnables), "prepared");
	returnables = updateFormattedReturnables(returnables, formatData(deliveredReturnables), "delivered");

	if (returnables.filter((p) => p.delivered > 0).length > 0) {
		total = getResourcesTotal(returnables, "delivered");
	} else if (returnables.filter((p) => p.prepared > 0).length > 0) {
		total = getResourcesTotal(returnables, "prepared");
	} else {
		total = getResourcesTotal(returnables, "ordered");
	}

	let formattedReturnedReturnables = updateFormattedReturnedReturnables(formatData(returnedReturnables));
	total.totalWholeSalePrice += formattedReturnedReturnables.totalWholeSalePrice;
	total.totalVatPrice += formattedReturnedReturnables.totalVatPrice;
	total.totalOnSalePrice += formattedReturnedReturnables.totalOnSalePrice;

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
		totalWholeSalePrice: 0,
		totalVatPrice: 0,
		totalOnSalePrice: 0,
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
		r.totalWholeSalePrice = r.delivered * r.unitWholeSalePrice;
		r.totalVatPrice = r.delivered * ((r.unitWholeSalePrice * r.vat) / 100);
		r.totalOnSalePrice = r.totalWholeSalePrice + r.totalVatPrice;

		total.totalWholeSalePrice += r.totalWholeSalePrice;
		total.totalVatPrice += r.totalVatPrice;
		total.totalOnSalePrice += r.totalOnSalePrice;
	});

	return {
		returnedReturnables : newReturnedReturnables,
		...total,
	};
};

const formatData = (data) => {
	let model = {
		data: [],
		totalWholeSalePrice: 0,
		totalVatPrice: 0,
		totalOnSalePrice: 0,
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
			grouped.totalWholeSalePrice += item.totalWholeSalePrice;
			grouped.totalVatPrice += item.totalVatPrice;
			grouped.totalOnSalePrice += item.totalOnSalePrice;
			grouped.quantity += item.quantity;
		}
	});

	Object.values(groupedData).map((value) => {
		model.totalWholeSalePrice += value.totalWholeSalePrice;
		model.totalVatPrice += value.totalVatPrice;
		model.totalOnSalePrice += value.totalOnSalePrice;
	});

	model.data = groupedData;

	return model;
};
