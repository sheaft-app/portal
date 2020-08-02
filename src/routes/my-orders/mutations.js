import gql from "graphql-tag";

export const CANCEL_MY_ORDERS = gql`
	mutation CancelPurchaseOrders($input: IdsWithReasonInput!) {
		cancelPurchaseOrders(input: $input) {
			nodes {
				id
				status
				reason
			}
		}
	}
`;
