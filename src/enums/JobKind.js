import GetEnumObjectFor from './helpers.js';

let enums = {
	CreateOrders: { Value: "CREATE_ORDERS", Label: "Création de commandes"},
	CreatePickingFromOrders: { Value: "CREATE_PICKING_FROM_ORDERS", Label: "Bon de préparation"},
	ImportProducts: { Value: "IMPORT_PRODUCTS", Label: "Import de produits"},
	ExportProducts: { Value: "EXPORT_PRODUCTS", Label: "Export de produits"},
	OrderPicking: { Value: "ORDER_PICKING", Label: ""},
	ExportAccountData: { Value: "EXPORT_ACCOUNT_DATA", Label: "Export RGPD"},
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
	}
};

Object.keys(enums).map(key => JobKind[key] = enums[key]);
Object.freeze(JobKind);

export default JobKind;
