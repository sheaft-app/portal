import gql from "graphql-tag";

export const GET_CATALOGS = gql`
	query Catalogs(
		$first: PaginationAmount
		$after: String
		$last: PaginationAmount
		$before: String
	) {
		catalogs(first: $first, after: $after, last: $last, before: $before) {
			edges {
				cursor
				node {
					id
					productsCount
					name
					kind
					isDefault
					isAvailable
					updatedOn
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

export const GET_CATALOG_DETAILS = gql`
	query Catalog($id: ID!) {
		catalog(input: $id) {
			id
			productsCount
			name
			kind
			isDefault
			isAvailable
			updatedOn
			products {
				id
				name
				reference
				onSalePrice
				onSalePricePerUnit
				vatPrice
				vatPricePerUnit
				wholeSalePrice
				wholeSalePricePerUnit
			}
		}
	}
`;

export const GET_CATALOG_PRODUCTS = gql`
query CatalogProducts($id: ID!) {
	catalogProducts(input: $id) {
		nodes {
			id
			name
			reference
			wholeSalePricePerUnit
			addedTo
		}
	}
}
`

export const GET_PRODUCTS = gql`
	query GetProducts {
		products {
			edges {
				node {
					id
					reference
					name
					wholeSalePricePerUnit
				}
			}
		}
	}
`