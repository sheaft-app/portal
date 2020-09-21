import gql from "graphql-tag";

export const CREATE_CONSUMER_ORDER = gql`
	mutation createOrder($input: CreateOrderInput!) {
		createOrder(input: $input) {
			id
			donation
			productsCount
			totalOnSalePrice
			totalPrice
			totalReturnableOnSalePrice
			totalFees
			returnablesCount
			user {
				id
			}
		}
	}
`;

export const UPDATE_CONSUMER_ORDER = gql`
	mutation updateOrder($input: UpdateOrderInput!) {
		updateOrder(input: $input) {
			id
			donation
			productsCount
			totalFees
			totalPrice
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
	mutation payOrder($input: IdInput) {
		payOrder(input: $input) {
			id
			redirectUrl
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
					country
					zipcode
				}
			}
		}
	}
`;

export const UPDATE_CONSUMER_LEGALS = gql`
	mutation updateConsumerLegals($input: UpdateConsumerLegalInput!) {
		updateConsumerLegals(input: $input) {
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
					country
					zipcode
				}
			}
		}
	}
`;
