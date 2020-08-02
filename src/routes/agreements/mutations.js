import gql from 'graphql-tag';

export const CANCEL_AGREEMENT = gql`
	mutation cancelAgreements($input: IdsWithReasonInput) {
		cancelAgreements(input: $input) {
			nodes {
				id
				status
			}
		}
	}
`

export const ACCEPT_AGREEMENT = gql`
	mutation acceptAgreement($input: IdTimeSlotGroupInput) {
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
	mutation refuseAgreements($input: IdsWithReasonInput) {
		refuseAgreements(input: $input) {
			nodes {
				id
				status
			}
		}
	}
`