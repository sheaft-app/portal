import gql from "graphql-tag";

export const SEARCH_COMPANY_SIRET = gql`
	query SearchBusinessWithSiret($input: String!) {
		searchBusinessWithSiret(input: $input) {
			address {
				line1
				line2
				zipcode
				city
			}
			active
			nic
			owner {
				firstName
				lastName
			}
			name
			kind
			siren
			siret
		}
	}
`;

export const GET_DEPARTMENTS = gql`
	query GetDepartments {
		departments {
			id
			code
			name
		}
	}
`;
