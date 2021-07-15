import GetEnumObjectFor from "./helpers.js";

let enums = {
	ExportPickingOrders: { Value: "EXPORT_PICKING_ORDERS", Label: "Bon de préparation" },
	ImportProducts: { Value: "IMPORT_PRODUCTS", Label: "Import de produits" },
	ExportUserData: { Value: "EXPORT_USER_DATA", Label: "Export RGPD" },
	ExportUserTransactions: { Value: "EXPORT_USER_TRANSACTIONS", Label: "Export des virements" },
	ExportPurchaseOrders: { Value: "EXPORT_USER_PURCHASE_ORDERS", Label: "Export des commandes" },
	ExportDeliveries: { Value: "EXPORT_USER_DELIVERIES", Label: "Export des ventes" },
};

let JobKind = {
	...enums,
	get: (value) => {
		return GetEnumObjectFor(enums, value);
	},
	label: (value) => {
		return GetEnumObjectFor(enums, value).Label;
	},
	value: (value) => {
		return GetEnumObjectFor(enums, value).Value;
	},
	color: (value) => {
		return GetEnumObjectFor(enums, value).Color;
	},
	icon: (value) => {
		return GetEnumObjectFor(enums, value).Icon;
	},
};

Object.keys(enums).map((key) => (JobKind[key] = enums[key]));
Object.freeze(JobKind);

export default JobKind;
