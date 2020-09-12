import gql from "graphql-tag";

export const GET_ME_DETAILS = gql`
	query GetMeDetails {
		me {
			id
			lastName
			firstName
			email
			phone
			picture
			birthdate
			countryOfResidence
			nationality
		}
	}
`;
