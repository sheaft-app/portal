import gql from "graphql-tag";

export const GET_ORDERS = gql`
	query GetOrders($first: Int, $last: Int, $after: String, $before: String, $orderBy: [PurchaseOrderSortInput!]) {
		purchaseOrders(
			first: $first
			last: $last
			after: $after
			before: $before
			order: $orderBy
			where: { status: { in: [WAITING, ACCEPTED] } }
		) {
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
					picking {
						id
					}
					delivery {
						id
					}
				}
			}
		}
	}
`;

export const GET_ORDERS_HISTORY = gql`
	query GetOrders($first: Int, $last: Int, $after: String, $before: String, $orderBy: [PurchaseOrderSortInput!]) {
		purchaseOrders(
			first: $first
			last: $last
			after: $after
			before: $before
			order: $orderBy
			where: { status: { in: [EXPIRED, REFUSED, WITHDRAWNED, CANCELLED] } }
		) {
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
					picking {
						id
					}
					delivery {
						id
					}
				}
			}
		}
	}
`;

export const GET_ACCEPTED_AGREEMENTS = gql`
	query GetAcceptedDetails {
		agreements(where: { status: { eq: ACCEPTED } }) {
			nodes {
				id
				store {
					id
					name
				}
				catalog {
					id
					products {
						id
						name
						reference
						wholeSalePrice
					}
				}
				delivery {
					id
					name
				}
			}
		}
	}
`;

export const GET_ORDER_DETAILS = gql`
	query GetOrderDetails($id: ID!) {
		purchaseOrder(id: $id) {
			id
			reference
			totalWholeSalePrice
			totalOnSalePrice
			totalVatPrice
			status
			totalReturnableOnSalePrice
			totalReturnableWholeSalePrice
			createdOn
			comment
			reason
			productsCount
			picking {
				id
			}
			delivery {
				id
				scheduledOn
				deliveredOn
				status
				deliveryFormUrl
			}
			expectedDelivery {
				expectedDeliveryDate
				day
				from
				to
				name
				kind
				address {
					line1
					zipcode
					city
				}
			}
			vendor {
				id
				name
				phone
				email
			}
			sender {
				id
				name
				email
				phone
				kind
			}
			products {
				id
				name
				reference
				quantity
				totalOnSalePrice
				totalProductOnSalePrice
				totalWholeSalePrice
				vat
				unitOnSalePrice
				unitWholeSalePrice
				totalReturnableOnSalePrice
				totalReturnableWholeSalePrice
			}
		}
	}
`;
