import gql from "graphql-tag";

export const GET_CATEGORIES = gql`
	query GetCategories {
		tags(where: { kind: { in: [CATEGORY] } }) {
			nodes {
				id
				kind
				icon
				name
			}
		}
	}
`;

export const GET_STORE_PRODUCERS = gql`
	query GetStoreProducers($id: ID!) {
		store(id: $id) {
			producers {
				id
				name
			}
		}
	}
`;

export const GET_COUNTRIES = gql`
	query GetCountries {
		countries {
			id
			code
			name
		}
	}
`;

export const GET_NATIONALITIES = gql`
	query GetNationalities {
		nationalities {
			id
			code
			name
		}
	}
`;

export const GET_BATCHES = gql`
	query GetDeliveryBatches {
		batches(first: 50) {
			nodes {
				id
				number
				ddm
				dlc
				observationsCount
				productsCount
				createdOn
			}
		}
	}
`;

export const GET_PRODUCER_PRODUCTS = gql`
	query GetProducerProducts($id: ID!) {
		producer(id: $id) {
			id
			products {
				id
				name
				onSalePricePerUnit
				wholeSalePricePerUnit
				picture
				rating
				quantityPerUnit
				conditioning
				unit
				available
				batches {
					id
					number
				}
			}
		}
	}
`;

export const GET_PRODUCTS_WITH_BATCHES = gql`
	query GetProductBatches {
		products {
			nodes {
				id
				name
				quantityPerUnit
				conditioning
				unit
				available
				batches {
					id
					number
				}
			}
		}
	}
`;

export const GET_BUSINESS_CLOSINGS = gql`
	query GetBusinessClosings {
		businessClosings {
			nodes {
				id
				from
				to
				reason
			}
		}
	}
`;

export const GET_OBSERVATIONS = gql`
	query GetObservations($producerId: ID, $batchId: ID, $first: Int, $after: String) {
		observations(first: $first, after: $after, producerId: $producerId, batchId: $batchId, order: { updatedOn: DESC }) {
			nodes {
				id
				comment
				user {
					id
					kind
					picture
					name
				}
				visibleToAll
				createdOn
				updatedOn
				batches {
					id
					number
				}
				products {
					id
					name
				}
				replies {
					id
					comment
					user {
						id
						picture
						kind
						name
					}
					createdOn
					updatedOn
				}
			}
			pageInfo {
				hasNextPage
				endCursor
			}
		}
	}
`;
