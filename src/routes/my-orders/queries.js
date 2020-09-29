import gql from "graphql-tag";

export const MY_ORDERS = gql`
	query MyOrders(
		$first: PaginationAmount
		$last: PaginationAmount
		$after: String
		$before: String
		$orderBy: PurchaseOrderDtoSort
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
			totalWholeSalePrice
			status
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
				unitOnSalePrice
			}
		}
	}
`;

export const MY_VALIDATING_ORDERS = gql`
	query {
		orders(where: { status_in: WAITING }) {
			nodes {
				id
				status
				totalPrice
			}
		}
	}
`