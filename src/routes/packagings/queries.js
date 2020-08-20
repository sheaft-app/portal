import gql from "graphql-tag";

export const GET_PACKAGINGS = gql`
	query Packagings(
		$first: PaginationAmount
		$after: String		
		$last: PaginationAmount
		$before: String
		$orderBy: PackagingDtoSort
	) {
		packagings(first: $first, after: $after, last: $last, before: $before, order_by: $orderBy) {
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

export const GET_PACKAGING_DETAILS = gql`
	query Packaging($id: ID!) {
		packaging(input: $id) {
			id
			name
			vat
			wholeSalePrice
			description
		}
	}
`;
