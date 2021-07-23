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
					userAffected
					producer {
						id
						name
					}
				}
			}
		}
	}
`;
