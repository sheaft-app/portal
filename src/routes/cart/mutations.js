import gql from "graphql-tag";

export const CREATE_CONSUMER_ORDER = gql`
	mutation createConsumerOrder($input: CreateOrderInput!) {
		createConsumerOrder(input: $input) {
			id
		}
	}
`;
