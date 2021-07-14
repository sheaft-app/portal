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
		pickings(where: { status: { in: [WAITING, PAUSED, IN_PROGRESS]}}) {
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
			purchaseOrders {
				id
				sender {
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
						name
					}
				}
			}
			preparedProducts {
				productId
				quantity
				name
				preparedOn
			}
		}
	}
`;


// todo : query récupération des lots existants