import gql from "graphql-tag";

export const GET_RECALLS = gql`
	query GetRecalls(
		$first: Int
		$last: Int
		$after: String
		$before: String
		$orderBy: [RecallSortInput!]
		$where: RecallFilterInput
	) {
		recalls(first: $first, last: $last, after: $after, before: $before, order: $orderBy, where: $where) {
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
					name
					status
					createdOn
					saleStartedOn
					saleEndedOn
					productsCount
					batchesCount
					clientsCount
				}
			}
		}
	}
`;

export const GET_RECALL = gql`
	query GetRecall($id: ID!) {
		recall(id: $id) {
			id
			name
			status
			comment
			createdOn
			saleStartedOn
			saleEndedOn
			productsCount
			batchesCount
			clientsCount
			products {
				id
				name
				reference
			}
			batches {
				id
				number
				dlc
				ddm
			}
			clients {
				id
				name
			}
		}
	}
`;

export const GET_BATCHES = gql`
	query GetRecallBatches {
		batches {
			nodes {
				id
				number
				dlc
				ddm
			}
		}
	}
`;

export const GET_PRODUCTS = gql`
	query GetRecallProducts {
		products {
			nodes {
				id
				reference
				name
			}
		}
	}
`;
