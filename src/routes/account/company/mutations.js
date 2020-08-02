import gql from "graphql-tag";

export const UPDATE_COMPANY = gql`
	mutation UpdateCompany($input: UpdateCompanyInput!) {
		updateCompany(input: $input) {
			id
		}
	}
`;

export const UPDATE_COMPANY_PICTURE = gql`
	mutation UpdateCompanyPicture($input: UpdatePictureInput!) {
		updateCompanyPicture(input: $input) {
			id
			picture
		}
	}
`;
