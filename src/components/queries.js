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