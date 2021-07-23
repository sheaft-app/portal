import gql from "graphql-tag";

export const CREATE_RECALL = gql`
	mutation CreateRecall($input: CreateRecallInput!) {
		createRecall(input: $input) {
			id
			name
			status
			comment
			createdOn
			saleStartedOn
			saleEndedOn
			productsCount
			batchesCount
			clientsCount
			batches {
				id
				number
				dlc
				ddm
			}
			products {
				id
				reference
				name
			}
			clients {
				id
				name
			}
		}
	}
`;

export const UPDATE_RECALL = gql`
	mutation UpdateRecall($input: UpdateRecallInput!) {
		updateRecall(input: $input) {
			id
			name
			status
			comment
			createdOn
			saleStartedOn
			saleEndedOn
			productsCount
			batchesCount
			clientsCount
			batches {
				id
				number
				dlc
				ddm
			}
			products {
				id
				reference
				name
			}
			clients {
				id
				name
			}
		}
	}
`;

export const QUEUE_SEND_RECALL = gql`
	mutation SendRecalls($input: QueueSendRecallsInput!) {
		sendRecalls(input: $input) {
			id
		}
	}
`;

export const DELETE_RECALLS = gql`
	mutation DeleteRecalls($input: DeleteRecallsInput!) {
		deleteRecalls(input: $input)
	}
`;
