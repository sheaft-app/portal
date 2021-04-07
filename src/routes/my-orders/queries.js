import gql from "graphql-tag";

export const MY_ORDERS = gql`
	query MyOrders(
		$first: PaginationAmount
		$last: PaginationAmount
		$after: String
		$before: String
		$orderBy: PurchaseOrderSort
	) {
		myOrders(
			first: $first
			last: $last
			after: $after
			before: $before
			order_by: $orderBy
		) {
			pageInfo {
				startCursor
				endCursor
				hasNextPage
				hasPreviousPage
			}
			totalCount
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
		purchaseOrder(input: $id) {
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
		orders(where: { OR: [{ status_in: WAITING }, { AND:[{status_in: VALIDATED}, {purchaseOrdersCount: 0}]}] }) {
			nodes {
				id
				status
				totalPrice
				purchaseOrdersCount
			}
		}
	}
`
