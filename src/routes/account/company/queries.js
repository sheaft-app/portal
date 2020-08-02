import gql from "graphql-tag";

export const GET_COMPANY_DETAILS = gql`
	query GetCompanyDetails {
		myCompany {
			id
			appearInBusinessSearchResults
			address {
				line1
				line2
				zipcode
				city
				latitude
				longitude
			}
			name
			vatIdentifier
			description
			siret
			picture
			email
			phone
		}
	}
`;
