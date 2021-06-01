import gql from "graphql-tag";

export const UPLOAD_PRODUCTS = gql`
	query ImportProducts($file: Upload!) {
		importProducts(file: $file) {
			id
		}
	}
`;

export const GET_PRODUCTS = gql`
	query GetProducts($first: Int, $after: String, $last: Int, $before: String, $orderBy: [ProductSortInput!]) {
		products(first: $first, after: $after, last: $last, before: $before, order: $orderBy) {
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
					reference
					name
					rating
					ratingsCount
					description
					vat
					createdOn
					available
					visibleTo
				}
			}
		}
	}
`;

export const GET_PRODUCT_DETAILS = gql`
	query GetProductDetails($id: ID!) {
		product(id: $id) {
			id
			reference
			name
			rating
			ratingsCount
			description
			weight
			picture
			vat
			catalogs {
				wholeSalePricePerUnit
				addedOn
				id
				kind
				name
			}
			quantityPerUnit
			conditioning
			unit
			returnable {
				id
				name
				vat
				wholeSalePrice
			}
			producer {
				id
				notSubjectToVat
			}
			createdOn
			tags {
				id
				name
				kind
			}
			available
			visibleTo
			pictures {
				id
				position
				large
			}
		}
	}
`;

export const GET_PRODUCER_DETAILS = gql`
	query GetProducerDetails {
		myProducerProfile {
			notSubjectToVat
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
	query hasPendingJobs($kinds: [JobKind!]) {
		hasPendingJobs(kinds: $kinds)
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
			nodes {
				id
				name
				icon
				kind
			}
		}
	}
`;
