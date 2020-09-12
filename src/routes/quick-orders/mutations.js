import gql from "graphql-tag";

export const CREATE_BUSINESS_ORDER = gql`
	mutation CreateBusinessOrder($input: CreateOrderInput!) {
		createBusinessOrder(input: $input) {
			nodes {
				id
			}
		}
	}
`;
