import gql from "graphql-tag";

export const UPDATE_BATCH = gql`
	mutation UpdateBatch($input: UpdateBatchInput!) {
		updateBatch(input: $input) {
			id
			number
			ddm
			dlc
			createdOn
		}
	}
`;
