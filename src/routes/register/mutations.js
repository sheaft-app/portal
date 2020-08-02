import gql from "graphql-tag";

export const REGISTER_COMPANY = gql`
	mutation RegisterCompany($input: RegisterCompanyInput!) {
		registerCompany(input: $input) {
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
