import gql from "graphql-tag";

export const GET_BATCHES = gql`
	query GetDeliveryBatches($first: Int, $last: Int, $after: String, $before: String, $orderBy: [BatchSortInput!]) {
		batches(first: $first, last: $last, after: $after, before: $before, order: $orderBy) {
			edges {
				cursor
				node {
					id
					number
					ddm
					dlc
					observationsCount
					productsCount
					createdOn
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

export const GET_BATCH_DETAILS = gql`
	query GetBatchDetails($id: ID!) {
		batch(id: $id) {
			id
			number
			dlc
			ddm
			lockedForEditing
			createdOn
			observationsCount
			products {
				id
				name
			}
			deliveries {
				id
				deliveredOn
				client {
					id
					name
				}
			}
		}
	}
`;

export const GET_PRODUCTS = gql`
	query GetProducts {
		products {
			edges {
				node {
					id
					reference
					name
				}
			}
		}
	}
`;
