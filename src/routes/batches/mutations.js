import gql from "graphql-tag";

export const CREATE_BATCH = gql`
	mutation CreateBatch($input: CreateBatchInput) {
		createBatch(input: $input) {
			id
			number
			dlc
			ddm
			createdOn
		}
	}
`;

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
