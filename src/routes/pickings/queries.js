import gql from "graphql-tag";

export const GET_ACCEPTED_ORDERS = gql`
	query GetAcceptedOrders {
		purchaseOrders(first: 50, where: { status: { in: [ACCEPTED] } }) {
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
						name
						expectedDeliveryDate
					}
					createdOn
					sender {
						id
						name
					}
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
					completedOn
					updatedOn
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
					completedOn
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
				reference
				sender {
					id
					name
				}
				products {
					name
					quantity
				}
				expectedDelivery {
					kind
				}
			}
			productsToPrepare {
				id
				name
				productId
				quantity
				conditioning
				quantityPerUnit
				unit
				purchaseOrder {
					id
					reference
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
					reference
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
