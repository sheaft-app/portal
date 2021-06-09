import gql from "graphql-tag";

export const GET_PRODUCER_DELIVERIES = gql`
	query GetProducerDeliveries($input: [ID!]) {
		nextProducersDeliveries(ids: $input, kinds: [FARM, MARKET, COLLECTIVE]) {
			id
			name
			deliveries {
				id
				kind
				address {
					city
					line1
					line2
					zipcode
					latitude
					longitude
				}
				deliveryHours {
					day
					from
					to
					expectedDeliveryDate
				}
			}
		}
	}
`;

export const GET_MY_ORDERS = gql`
	query MyOrder($id: ID!) {
		order(id: $id) {
			id
			reference
			purchaseOrders {
				id
				reference
				totalOnSalePrice
				expectedDelivery {
					expectedDeliveryDate
					day
					from
					to
				}
				vendor {
					name
				}
			}
		}
	}
`;

export const GET_MY_ORDER_FROM_TRANSACTION = gql`
	query MyOrderFromTransaction($id: StringType!) {
		orderFromTransaction(identifier: $id) {
			id
			reference
			purchaseOrders {
				id
				reference
				totalOnSalePrice
				expectedDelivery {
					expectedDeliveryDate
					day
					from
					to
				}
				vendor {
					name
				}
			}
		}
	}
`;

export const GET_ORDER = gql`
	query order($input: ID!) {
		order(id: $input) {
			id
			totalFees
			status
			donation
			totalOnSalePrice
			productsCount
			totalPrice
			totalReturnableOnSalePrice
			returnablesCount
			user {
				id
			}
		}
	}
`;

export const GET_MY_CONSUMER_LEGALS = gql`
	query GetMyConsumerLegals {
		consumerLegals {
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
