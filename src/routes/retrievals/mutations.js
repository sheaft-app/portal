import gql from "graphql-tag";

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
