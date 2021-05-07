import gql from "graphql-tag";

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
					name
				}
				sender {
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
					name
				}
				sender {
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
					name
				}
				sender {
					name
					email
					phone
				}
		}
	}
`;

export const PROCESS_PURCHASE_ORDERS = gql`
	mutation ProcessPurchaseOrders($input: ProcessPurchaseOrdersInput!) {
		processPurchaseOrders(input: $input) {
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
					name
				}
				sender {
					name
					email
					phone
				}
		}
	}
`;

export const COMPLETE_PURCHASE_ORDERS = gql`
	mutation CompletePurchaseOrders($input: CompletePurchaseOrdersInput!) {
		completePurchaseOrders(input: $input) {
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
					name
				}
				sender {
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
					name
				}
				sender {
					name
					email
					phone
				}
		}
	}
`;

export const UPLOAD_PURCHASE_ORDERS = gql`
	mutation UploadPurchaseOrders(
		$files: [Upload]
		$mappings: [FileToCompanyMappingInputType]
	) {
		uploadPurchaseOrders(files: $files, mappings: $mappings) {
			id
		}
	}
`;

export const EXPORT_PICKING_FROM_ORDERS = gql`
	mutation ExportPickingFromOrders($input: ExportPickingOrdersInput!) {
		exportPickingFromOrders(input: $input) {
			id
			name
			createdOn
			updatedOn
			status
			kind
			startedOn
			completedOn
			file
			user {
				name
			}
		}
	}
`;
