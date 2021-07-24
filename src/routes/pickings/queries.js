import gql from "graphql-tag";

export const GET_AVAILABLE_PICKINGS = gql`
	query GetAvailablePickings($includePendingPurchaseOrders: Boolean!) {
		availablePickings(includePendingPurchaseOrders: $includePendingPurchaseOrders) {
			name
			expectedDeliveryDate
			purchaseOrdersCount
			productsCount
			clientsCount
			clients {
				id
				name
				purchaseOrdersCount
				purchaseOrders {
					id
					productsCount
					expectedDeliveryDate
					totalWholeSalePrice
				}
			}
		}
	}
`;

export const GET_PICKINGS = gql`
	query GetPickings {
		pickings(where: { status: { in: [WAITING, PAUSED, IN_PROGRESS] } }) {
			edges {
				cursor
				node {
					id
					status
					name
					startedOn
					productsPreparedCount
					productsToPrepareCount
					purchaseOrdersCount
					preparationUrl
				}
			}
			pageInfo {
				hasPreviousPage
				hasNextPage
				startCursor
				endCursor
			}
		}
	}
`;

export const GET_PICKINGS_HISTORY = gql`
	query GetPickingsHistory($first: Int, $last: Int, $after: String, $before: String, $orderBy: [PickingSortInput!]) {
		pickings(
			first: $first
			last: $last
			after: $after
			before: $before
			order: $orderBy
			where: { status: { in: [COMPLETED] } }
		) {
			edges {
				cursor
				node {
					id
					status
					name
					startedOn
					productsPreparedCount
					productsToPrepareCount
					purchaseOrdersCount
					preparationUrl
				}
			}
			pageInfo {
				hasPreviousPage
				hasNextPage
				startCursor
				endCursor
			}
		}
	}
`;

export const GET_PICKING_DETAILS = gql`
	query GetPickingDetails($id: ID!) {
		picking(id: $id) {
			id
			status
			name
			preparationUrl
			completedOn
			startedOn
			productsPreparedCount
			productsToPrepareCount
			purchaseOrdersCount
			purchaseOrders {
				id
				sender {
					id
					name
				}
				products {
					name
					quantity
				}
			}
			productsToPrepare {
				id
				name
				productId
				quantity
				purchaseOrder {
					id
					sender {
						id
						name
					}
				}
			}
			preparedProducts {
				productId
				quantity
				completed
				name
				batches {
					id
				}
				purchaseOrder {
					id
				}
				preparedOn
			}
		}
	}
`;

export const GET_BATCHES = gql`
	query GetBatches {
		batches(validOnly: true) {
			nodes {
				id
				number
				dlc
				ddm
			}
		}
	}
`;
