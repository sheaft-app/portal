import gql from "graphql-tag";

export const DELETE_DELIVERY_BATCH = gql`
	mutation CancelDeliveryBatch($input: CancelDeliveryBatchInput) {
		cancelDeliveryBatch(input: $input) {
			id
		}
	}
`;

export const CREATE_DELIVERY_BATCH = gql`
	mutation CreateDeliveryBatch($input: CreateDeliveryBatchInput) {
		createDeliveryBatch(input: $input) {
			id
		}
	}
`;

export const UPDATE_DELIVERY_BATCH = gql`
	mutation UpdateDeliveryBatch($input: UpdateDeliveryBatchInput) {
		updateDeliveryBatch(input: $input) {
			id
		}
	}
`;

export const START_DELIVERY_BATCH = gql`
mutation StartDeliveryBatch($input: StartDeliveryBatchInput) {
	startDeliveryBatch(input: $input) {
		id
	}
}
`;

export const COMPLETE_DELIVERY = gql`
mutation CompleteDelivery($input: CompleteDeliveryInput) {
	completeDelivery(input: $input) {
		id
	}
}
`
export const SET_NEXT_DELIVERY = gql`
mutation SetNextDelivery($input: SetNextDeliveryInput) {
	setNextDeliveryForBatch(input: $input) {
		id
	}
}
`