import gql from "graphql-tag";

export const CREATE_BUSINESS_ORDER = gql`
	mutation CreatePurchaseOrders($input: CreatePurchaseOrdersInput!) {
		createPurchaseOrders(input: $input) {
			nodes {
				id
			}
		}
	}
`;
