export const getPurchaseOrderModel = (products, returnedReturnables) => {
	let productsGroupedToBill = {};
	let returnablesGroupedToBill = {};
	let model = {
		products: [],
		returnables: [],
		totalWholeSalePrice: 0,
		totalVatPrice: 0,
		totalOnSalePrice: 0,
	};

	if (products) {
		for (let i = 0; i < products.length; i++) {
			if (!productsGroupedToBill[products[i].productId])
				productsGroupedToBill[products[i].productId] = {
					id: products[i].productId,
					name: products[i].name,
					reference: products[i].reference,
					quantity: products[i].quantity,
					vat: products[i].vat,
					unitWholeSalePrice: products[i].unitWholeSalePrice,
					totalWholeSalePrice: products[i].totalProductWholeSalePrice,
					totalOnSalePrice: products[i].totalProductOnSalePrice,
					totalVatPrice: products[i].totalProductVatPrice,
				};
			else {
				productsGroupedToBill[products[i].productId].quantity += products[i].quantity;
				productsGroupedToBill[products[i].productId].totalWholeSalePrice += products[i].totalProductWholeSalePrice;
				productsGroupedToBill[products[i].productId].totalOnSalePrice += products[i].totalProductOnSalePrice;
				productsGroupedToBill[products[i].productId].totalVatPrice += products[i].totalProductVatPrice;
			}

			if (!products[i].isReturnable) continue;

			if (!returnablesGroupedToBill[products[i].returnableId])
				returnablesGroupedToBill[products[i].returnableId] = {
					id: products[i].returnableId,
					name: `${products[i].returnableName} (Consignes déposées)`,
					quantity: products[i].quantity,
					vat: products[i].returnableVat,
					unitWholeSalePrice: products[i].returnableWholeSalePrice,
					totalWholeSalePrice: products[i].totalReturnableWholeSalePrice,
					totalOnSalePrice: products[i].totalReturnableOnSalePrice,
					totalVatPrice: products[i].totalReturnableVatPrice,
				};
			else {
				returnablesGroupedToBill[products[i].returnableId].quantity += products[i].quantity;
				returnablesGroupedToBill[products[i].returnableId].totalWholeSalePrice +=
					products[i].totalReturnableWholeSalePrice;
				returnablesGroupedToBill[products[i].returnableId].totalOnSalePrice += products[i].totalReturnableOnSalePrice;
				returnablesGroupedToBill[products[i].returnableId].totalVatPrice += products[i].totalReturnableVatPrice;
			}
		}
	}

	if (returnedReturnables) {
		for (let i = 0; i < returnedReturnables.length; i++) {
			if (!returnablesGroupedToBill[returnedReturnables[i].id])
				returnablesGroupedToBill[returnedReturnables[i].id] = {
					id: returnedReturnables[i].id,
					name: `${returnedReturnables[i].name} (Consignes récupérées)`,
					quantity: returnedReturnables[i].quantity,
					vat: returnedReturnables[i].vat,
					unitWholeSalePrice: returnedReturnables[i].unitWholeSalePrice,
					totalWholeSalePrice: returnedReturnables[i].totalWholeSalePrice,
					totalOnSalePrice: returnedReturnables[i].totalOnSalePrice,
					totalVatPrice: returnedReturnables[i].totalVatPrice,
				};
			else {
				returnablesGroupedToBill[returnedReturnables[i].id].quantity += returnedReturnables[i].quantity;
				returnablesGroupedToBill[returnedReturnables[i].id].totalWholeSalePrice +=
					returnedReturnables[i].totalWholeSalePrice;
				returnablesGroupedToBill[returnedReturnables[i].id].totalOnSalePrice += returnedReturnables[i].totalOnSalePrice;
				returnablesGroupedToBill[returnedReturnables[i].id].totalVatPrice += returnedReturnables[i].totalVatPrice;
			}
		}
	}

	Object.keys(productsGroupedToBill).map((id) => {
		model.totalWholeSalePrice += productsGroupedToBill[id].totalWholeSalePrice;
		model.totalVatPrice += productsGroupedToBill[id].totalVatPrice;
		model.totalOnSalePrice += productsGroupedToBill[id].totalOnSalePrice;
	});

	Object.keys(returnablesGroupedToBill).map((id) => {
		model.totalWholeSalePrice += returnablesGroupedToBill[id].totalWholeSalePrice;
		model.totalVatPrice += returnablesGroupedToBill[id].totalVatPrice;
		model.totalOnSalePrice += returnablesGroupedToBill[id].totalOnSalePrice;
	});

	model.products = Object.keys(productsGroupedToBill).map((id) => productsGroupedToBill[id]);
	model.returnables = Object.keys(returnablesGroupedToBill).map((id) => returnablesGroupedToBill[id]);

	return model;
};
