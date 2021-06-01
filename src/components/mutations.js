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
