import gql from "graphql-tag";

export const CREATE_CONSUMER_ORDER = gql`
	mutation createOrder($input: CreateOrderInput!) {
		createOrder(input: $input) {
			id
			fees
			donation
			productsCount
			totalOnSalePrice
			totalReturnableOnSalePrice
			returnablesCount
			user {
				id
			}
		}
	}
`;

export const PAY_ORDER = gql`
	mutation payOrder($input: PayOrderInput!) {
		payOrder(input: $input) {
			id
		}
	}
`;

export const CREATE_CONSUMER_LEGALS = gql`
	mutation createConsumerLegals($input: CreateConsumerLegalInput!) {
		createConsumerLegals(input: $input) {
			id
			owner {
				firstName
				lastName
				email
				nationality
				birthDate
				countryOfResidence
				address {
					line1
					line2
					city
					zipcode
				}
			}
		}
	}
`;
