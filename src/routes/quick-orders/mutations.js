import gql from "graphql-tag";

export const CREATE_BUSINESS_ORDER = gql`
	mutation CreatePurchaseOrders($input: CreatePurchaseOrdersInput!) {
		createBusinessOrder(input: $input) {
			id
		}
	}
`;

export const CREATE_QUICKORDER = gql`
	mutation CreateQuickOrder($input: CreateQuickOrderInput!) {
		createQuickOrder(input: $input) {
			id
		}
	}
`;

export const UPDATE_QUICKORDER = gql`
	mutation UpdateQuickOrder($input: UpdateQuickOrderInput!) {
		updateQuickOrder(input: $input) {
			id
		}
	}
`;

export const SET_QUICKORDER_AS_DEFAULT = gql`
	mutation SetQuickOrderAsDefault($input: SetQuickOrderAsDefaultInput!) {
		setQuickOrderAsDefault(input: $input) {
			id
		}
	}
`;

export const DELETE_QUICKORDERS = gql`
	mutation DeleteQuickOrders($input: DeleteQuickOrdersInput!) {
		deleteQuickOrders(input: $input)
	}
`;
