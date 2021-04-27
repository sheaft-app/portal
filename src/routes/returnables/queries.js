import gql from "graphql-tag";

export const GET_RETURNABLES = gql`
	query Returnables(
		$first: Int
		$after: String
		$last: Int
		$before: String
		$orderBy: [ReturnableSort!]
	) {
		returnables(first: $first, after: $after, last: $last, before: $before, order: $orderBy) {
			edges {
				cursor
				node {
					id
					name
					vat
					wholeSalePrice
					onSalePrice
				}
			}
			pageInfo{
				hasPreviousPage
				hasNextPage
				startCursor
				endCursor
			}
		}
	}
`;

export const GET_RETURNABLE_DETAILS = gql`
	query Returnable($id: ID!) {
		returnable(input: $id) {
			id
			name
			vat
			wholeSalePrice
			description
		}
	}
`;
