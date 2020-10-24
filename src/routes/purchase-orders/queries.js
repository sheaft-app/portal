import gql from "graphql-tag";

export const GET_ORDERS = gql`
	query GetOrders(
		$first: PaginationAmount
		$last: PaginationAmount
		$after: String
		$before: String
		$orderBy: PurchaseOrderDtoSort
		$where: PurchaseOrderDtoFilter
	) {
		purchaseOrders(
			first: $first
			last: $last
			after: $after
			before: $before
			order_by: $orderBy
			where: $where
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
		}
	}
`;

export const GET_ORDER_DETAILS = gql`
	query GetOrderDetails($id: ID!) {
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
				totalReturnableOnSalePrice
			}
		}
	}
`;

export const HAS_PICKING_ORDERS_EXPORT_INPROGRESS = gql`
	query PickingOrdersExportInProgress {
		pickingOrdersExportInProgress
	}
`;