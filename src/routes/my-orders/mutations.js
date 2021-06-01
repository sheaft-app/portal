import gql from "graphql-tag";

export const CANCEL_MY_ORDERS = gql`
	mutation CancelPurchaseOrders($input: WithdrawnPurchaseOrdersInput!) {
		withdrawnPurchaseOrders(input: $input) {
			id
			totalOnSalePrice
			totalWholeSalePrice
			totalVatPrice
			reference
			productsCount
			expectedDelivery {
				expectedDeliveryDate
				day
				from
				to
				kind
				address {
					line1
					zipcode
					city
				}
			}
			createdOn
			status
			vendor {
				name
				email
				phone
			}
			sender {
				name
			}
		}
	}
`;
