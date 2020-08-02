import gql from "graphql-tag";

export const CREATE_ORDER = gql`
	mutation CreateOrder($input: CreatePurchaseOrdersInput!) {
		createPurchaseOrders(input: $input) {
			nodes {
				id
			}
		}
	}
`;
