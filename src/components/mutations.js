import gql from "graphql-tag";

export const UPDATE_BUSINESS_CLOSINGS = gql`
	mutation UpdateBusinessClosings($input: UpdateOrCreateBusinessClosingsInput!) {
		updateOrCreateBusinessClosings(input: $input) {
			id
			from
			to
			reason
		}
	}
`;

export const REPLY_TO_OBSERVATION = gql`
	mutation ReplyToObservation($input: ReplyToObservationInput!) {
		replyToObservation(input: $input) {
			id
			comment
			user {
				id
				picture
				kind
				name
			}
			createdOn
			updatedOn
			batches {
				id
				number
				products {
					id
					name
				}
			}
			replies {
				id
				comment
				user {
					id
					kind
					picture
					name
				}
				createdOn
				updatedOn
			}
		}
	}
`

export const CREATE_OBSERVATION = gql`
	mutation CreateObservation($input: CreateObservationInput!) {
		createObservation(input: $input) {
			id
			comment
			user {
				id
				picture
				name
			}
			createdOn
			updatedOn
			batches {
				id
				number
				products {
					id
					name
				}
			}
			replies {
				id
				comment
				user {
					id
					picture
					name
				}
				createdOn
				updatedOn
			}
		}
	}
`