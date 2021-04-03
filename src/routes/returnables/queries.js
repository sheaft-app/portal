import gql from "graphql-tag";

export const GET_RETURNABLES = gql`
	query Returnables(
		$first: PaginationAmount
		$after: String
		$last: PaginationAmount
		$before: String
		$orderBy: ReturnableSort
	) {
		returnables(first: $first, after: $after, last: $last, before: $before, order_by: $orderBy) {
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
			totalCount
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
