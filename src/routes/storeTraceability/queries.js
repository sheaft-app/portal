import gql from "graphql-tag";

export const GET_PRODUCERS = gql`
	query GetProducers($id: ID!) {
		store(id: $id) {
			producers {
				id
				name
				picture
			}
		}
	}
`;
