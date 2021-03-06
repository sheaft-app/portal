import gql from "graphql-tag";

export const GET_ORDERS = gql`
	query GetOrders(
		$first: Int
		$last: Int
		$after: String
		$before: String
		$orderBy: [PurchaseOrderSortInput!]
		$where: PurchaseOrderFilterInput
	) {
		purchaseOrders(first: $first, last: $last, after: $after, before: $before, order: $orderBy, where: $where) {
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
			delivery {
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
