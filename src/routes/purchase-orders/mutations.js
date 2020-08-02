import gql from "graphql-tag";

export const ACCEPT_PURCHASE_ORDERS = gql`
	mutation AcceptPurchaseOrders($input: IdsInput!) {
		acceptPurchaseOrders(input: $input) {
			nodes {
				id
				status
				expectedDelivery {
					expectedDeliveryDate
				}
			}
		}
	}
`;

export const REFUSE_PURCHASE_ORDERS = gql`
	mutation RefusePurchaseOrders($input: IdsWithReasonInput!) {
		refusePurchaseOrders(input: $input) {
			nodes {
				id
				status
				expectedDelivery {
					expectedDeliveryDate
				}
			}
		}
	}
`;

export const CANCEL_PURCHASE_ORDERS = gql`
	mutation CancelPurchaseOrders($input: IdsWithReasonInput!) {
		cancelPurchaseOrders(input: $input) {
			nodes {
				id
				status
				expectedDelivery {
					expectedDeliveryDate
				}
			}
		}
	}
`;

export const PROCESS_PURCHASE_ORDERS = gql`
	mutation ProcessPurchaseOrders($input: IdsInput!) {
		processPurchaseOrders(input: $input) {
			nodes {
				id
				status
				expectedDelivery {
					expectedDeliveryDate
				}
			}
		}
	}
`;

export const COMPLETE_PURCHASE_ORDERS = gql`
	mutation CompletePurchaseOrders($input: IdsInput!) {
		completePurchaseOrders(input: $input) {
			nodes {
				id
				status
				expectedDelivery {
					expectedDeliveryDate
				}
			}
		}
	}
`;

export const DELIVER_PURCHASE_ORDERS = gql`
	mutation DeliverPurchaseOrders($input: IdsInput!) {
		deliverPurchaseOrders(input: $input) {
			nodes {
				id
				status
				expectedDelivery {
					expectedDeliveryDate
				}
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
	mutation ExportPickingFromOrders($input: IdsInput!) {
		exportPickingFromOrders(input: $input) {
			nodes {
				id
				status
				expectedDelivery {
					expectedDeliveryDate
				}
			}
		}
	}
`;
