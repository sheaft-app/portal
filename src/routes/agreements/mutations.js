import gql from 'graphql-tag';

export const CANCEL_AGREEMENT = gql`
	mutation cancelAgreements($input: CancelAgreementsInput!) {
		cancelAgreements(input: $input) {
			nodes {
				id
				status
			}
		}
	}
`

export const ACCEPT_AGREEMENT = gql`
	mutation acceptAgreement($input: AcceptAgreementInput!) {
		acceptAgreement(input: $input) {
			id
			status
			selectedHours {
				day
				from
				to
			}
		}
	}
`

export const REFUSE_AGREEMENTS = gql`
	mutation refuseAgreements($input: RefuseAgreementsInput!) {
		refuseAgreements(input: $input) {
			nodes {
				id
				status
			}
		}
	}
`
