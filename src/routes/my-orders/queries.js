import gql from "graphql-tag";

export const MY_ORDERS = gql`
	query MyOrders($first: Int, $last: Int, $after: String, $before: String, $orderBy: [PurchaseOrderSortInput!]) {
		purchaseOrders(first: $first, last: $last, after: $after, before: $before, order: $orderBy) {
			pageInfo {
				startCursor
				endCursor
				hasNextPage
				hasPreviousPage
			}
			edges {
				cursor
				node {
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
							latitude
							longitude
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
		}
	}
`;

export const GET_MY_ORDER_DETAILS = gql`
	query GetMyOrderDetails($id: ID!) {
		purchaseOrder(id: $id) {
			id
			reference
			totalOnSalePrice
			status
			totalReturnableOnSalePrice
			createdOn
			totalVatPrice
			reason
			productsCount
			expectedDelivery {
				expectedDeliveryDate
				deliveredOn
				day
				from
				to
				name
				kind
				address {
					line1
					zipcode
					city
					latitude
					longitude
				}
			}
			vendor {
				name
				phone
				email
			}
			sender {
				name
				email
				phone
			}
			products {
				id
				name
				reference
				quantity
				totalOnSalePrice
				totalOnSalePrice
				unitOnSalePrice
				totalReturnableOnSalePrice
			}
		}
	}
`;

export const MY_VALIDATING_ORDERS = gql`
	query {
		orders(where: { or: [{ status: { in: [WAITING] } }, { status: { in: [VALIDATED] } }] }) {
			nodes {
				id
				status
				totalPrice
				purchaseOrdersCount
			}
		}
	}
`;
