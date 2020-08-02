import gql from "graphql-tag";

export const CREATE_AGREEMENT = gql`
	mutation createAgreement($input: CreateAgreementInput!) {
		createAgreement(input: $input) {
			id
			status
		}
	}
`;

export const CANCEL_AGREEMENT = gql`
	mutation cancelAgreements($input: CancelAgreementsInput!) {
		cancelAgreements(input: $input) {
			id
			status
		}
	}
`