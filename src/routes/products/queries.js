import gql from "graphql-tag";

export const GET_PRODUCTS = gql`
	query GetProducts(
		$first: PaginationAmount
		$after: String		
		$last: PaginationAmount
		$before: String
		$orderBy: ProductDtoSort
	) {
		products(first: $first, after: $after, last: $last, before: $before, order_by: $orderBy) {
			pageInfo {
				startCursor
				endCursor
				hasNextPage
				hasPreviousPage
			}
			totalCount
			edges {
				cursor
				node {
					id
					reference
					onSalePricePerUnit
					wholeSalePricePerUnit
					name
					rating
					ratingsCount
					description
					vat
					vatPricePerUnit
					createdOn
					available
					visibleToStores
					visibleToConsumers
				}
			}
		}
	}
`;

export const GET_PRODUCT_DETAILS = gql`
	query GetProductDetails($id: ID!) {
		product(input: $id) {
			id
			reference
			onSalePricePerUnit
			wholeSalePricePerUnit
			name
			rating
			ratingsCount
			description
			weight
			picture
			vat
			quantityPerUnit
			conditioning
			unit
			returnable {
				id
				name
				vat
				wholeSalePrice
			}
			vatPricePerUnit
			createdOn
			tags {
				id
				name
				kind
			}
			available
			visibleToStores
			visibleToConsumers
		}
	}
`;

export const GET_PRODUCT_RATINGS = gql`
	query GetProductRatings($id: ID!) {
		product(input: $id) {
			id
			name
			rating
			ratingsCount
			ratings {
				nodes {
					value
					comment
					createdOn
					user {
						name
						picture
					}
				}
			}
		}
	}
`;

export const HAS_PRODUCTS_IMPORT_INPROGRESS = gql`
	query ProductsImportInProgress {
		productsImportInProgress
	}
`;

export const GET_RETURNABLES = gql`
	query Returnables {
		returnables {
			nodes {
				id
				name
				vat
				wholeSalePrice
			}
		}
	}
`;

export const GET_TAGS = gql`
	query Tags {
		tags {
			id
			name
			icon
			kind
		}
	}
`;