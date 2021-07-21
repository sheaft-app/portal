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
	query GetObservations {
		observations {
			nodes {
				id
				comment
				user {
					id
					picture
					name
				}
				createdOn
				updatedOn
				replies {
					id
					comment
					user {
						id
						picture
						name
					}
					createdOn
					updatedOn
				}
			}
		}
	}
`