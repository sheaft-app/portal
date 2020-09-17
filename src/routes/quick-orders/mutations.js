import gql from "graphql-tag";

export const CREATE_BUSINESS_ORDER = gql`
	mutation CreatePurchaseOrders($input: CreateOrderInput!) {
		createPurchaseOrders(input: $input) {
			nodes {
				id
			}
		}
	}
`;
