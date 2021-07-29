import gql from "graphql-tag";

export const CREATE_PICKING = gql`
	mutation CreatePicking($input: CreatePickingInput) {
		createPicking(input: $input) {
			id
		}
	}
`;

export const UPDATE_PICKING = gql`
	mutation UpdatePicking($input: UpdatePickingInput) {
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

export const DELETE_PICKING = gql`
	mutation DeletePicking($input: DeletePickingInput) {
		deletePicking(input: $input)
	}
`;

export const SET_PICKING_PRODUCT_PREPARED_QUANTITY = gql`
	mutation SetPickingProductPreparedQuantity($input: SetPickingProductPreparedQuantityInput) {
		setPickingProductPreparedQuantity(input: $input) {
			id
		}
	}
`;
