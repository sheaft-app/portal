import gql from "graphql-tag";

export const CREATE_PICKING = gql`
	mutation CreatePicking($input: CreatePickingInput) {
		createPicking(input: $input) {
			id
		}
	}
`;

export const CREATE_DELIVERY_BATCH = gql`
	mutation CreateDeliveryBatch($input: CreateDeliveryBatchInput) {
		createDeliveryBatch(input: $input) {
			id
		}
	}
`;

export const CREATE_PURCHASE_ORDER = gql`
	mutation CreatePurchaseOrder($input: CreatePurchaseOrderInput) {
		createPurchaseOrder(input: $input) {
			id
		}
	}
`;

export const ACCEPT_PURCHASE_ORDERS = gql`
	mutation AcceptPurchaseOrders($input: AcceptPurchaseOrdersInput!) {
		acceptPurchaseOrders(input: $input) {
			id
			totalOnSalePrice
			totalWholeSalePrice
			totalVatPrice
			reference
			productsCount
			expectedDelivery {
				kind
				expectedDeliveryDate
			}
			createdOn
			status
			vendor {
				id
				name
			}
			sender {
				id
				name
				email
				phone
			}
		}
	}
`;

export const REFUSE_PURCHASE_ORDERS = gql`
	mutation RefusePurchaseOrders($input: RefusePurchaseOrdersInput!) {
		refusePurchaseOrders(input: $input) {
			id
			totalOnSalePrice
			totalWholeSalePrice
			totalVatPrice
			reference
			productsCount
			expectedDelivery {
				kind
				expectedDeliveryDate
			}
			createdOn
			status
			vendor {
				id
				name
			}
			sender {
				id
				name
				email
				phone
			}
		}
	}
`;

export const CANCEL_PURCHASE_ORDERS = gql`
	mutation CancelPurchaseOrders($input: CancelPurchaseOrdersInput!) {
		cancelPurchaseOrders(input: $input) {
			id
			totalOnSalePrice
			totalWholeSalePrice
			totalVatPrice
			reference
			productsCount
			expectedDelivery {
				kind
				expectedDeliveryDate
			}
			createdOn
			status
			vendor {
				id
				name
			}
			sender {
				id
				name
				email
				phone
			}
		}
	}
`;

export const DELIVER_PURCHASE_ORDERS = gql`
	mutation DeliverPurchaseOrders($input: DeliverPurchaseOrdersInput!) {
		deliverPurchaseOrders(input: $input) {
			id
			totalOnSalePrice
			totalWholeSalePrice
			totalVatPrice
			reference
			productsCount
			expectedDelivery {
				kind
				expectedDeliveryDate
			}
			createdOn
			status
			vendor {
				id
				name
			}
			sender {
				id
				name
				email
				phone
			}
		}
	}
`;
