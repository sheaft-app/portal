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
	  nodes{
		id
		code
		name
	  }
  }
}
`;

export const GET_NATIONALITIES = gql`
query GetNationalities {
  nationalities {
	nodes{
	  id
	  code
	  name
	}
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
