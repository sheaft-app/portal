import gql from "graphql-tag";

export const GET_CATEGORIES = gql`
	query GetCategories {
		tags(where: { kind_in: CATEGORY }) {
			id
      kind
      icon
			name
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
		producerProducts(input: $id) {
			nodes {
				id
				name
				onSalePricePerUnit
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
		businessClosings
		{
			nodes {	
				id
				from
				to
				reason
			}
		}
	}
`
