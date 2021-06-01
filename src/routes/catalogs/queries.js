import gql from "graphql-tag";

export const GET_CATALOGS = gql`
	query Catalogs($first: Int, $after: String, $last: Int, $before: String) {
		catalogs(first: $first, after: $after, last: $last, before: $before) {
			edges {
				cursor
				node {
					id
					name
					kind
					isDefault
					available
					updatedOn
					productsCount
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

export const GET_CATALOG_DETAILS = gql`
	query Catalog($id: ID!) {
		catalog(id: $id) {
			id
			name
			kind
			isDefault
			available
			updatedOn
			products {
				id
				name
				reference
				wholeSalePricePerUnit
				addedOn
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
