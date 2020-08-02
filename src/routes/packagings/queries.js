import gql from "graphql-tag";

export const GET_PACKAGINGS = gql`
	query Packagings {
		packagings {
			nodes {
				id
				name
				vat
				wholeSalePrice
				onSalePrice
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
