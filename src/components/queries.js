import gql from "graphql-tag";

export const GET_CATEGORIES = gql`
	query GetCategories {
		tags(where: { kind: { in: [CATEGORY] }}) {
			nodes{
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
