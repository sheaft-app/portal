import gql from "graphql-tag";

export const REGISTER_STORE = gql`
	mutation RegisterStore($input: RegisterStoreInput!) {
		registerStore(input: $input) {
			id
		}
	}
`;

export const REGISTER_PRODUCER = gql`
	mutation RegisterProducer($input: RegisterProducerInput!) {
		registerProducer(input: $input) {
			id
		}
	}
`;

export const REGISTER_CONSUMER = gql`
	mutation RegisterConsumer($input: RegisterConsumerInput!) {
		registerConsumer(input: $input) {
			id
		}
	}
`;
