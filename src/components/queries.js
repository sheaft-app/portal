import gql from "graphql-tag";

export const GET_CATEGORIES = gql`
	query GetCategories {
		tags(where: { kind_in: CATEGORY }) {
			id
			kind
			name
		}
	}
`;
