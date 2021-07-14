import gql from "graphql-tag";

export const CREATE_PREPARATION = gql`
	mutation CreatePreparation($input: CreatePickingInput) {
		createPicking(input: $input) {
			id
		}
	}
`;

export const UPDATE_PREPARATION = gql`
	mutation UpdatePreparation($input: UpdatePickingInput) {
		updatePicking(input: $input) {
			id
		}
	}
`;

export const START_PICKING = gql`
	mutation StartPicking($input: StartPickingInput) {
		startPicking(input: $input) {
			id
		}
	}
`;

export const PAUSE_PICKING = gql`
	mutation PausePicking($input: PausePickingInput) {
		pausePicking(input: $input) {
			id
		}
	}
`;

export const SET_PICKING_PRODUCT_PREPARED_QUANTITY = gql`
	mutation SetPickingProductPreparedQuantity($input: SetPickingProductPreparedQuantityInput) {
		setPickingProductPreparedQuantity(input: $input) {
			id
		}
	}
`;

export const CREATE_BATCH = gql`
	mutation CreateBatch($input: CreateBatchInput) {
		createBatch(input: $input) {
			id
		}
	}
`;