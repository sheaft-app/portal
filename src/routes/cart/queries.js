import gql from "graphql-tag";

export const GET_PRODUCER_DELIVERIES = gql`
	query GetProducerDeliveries($input: SearchProducersDeliveriesInput) {
		getDeliveriesForProducers(input: $input) {
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
				deliveryHours(order_by: { expectedDeliveryDate: "ASC" }) {
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
	query MyOrders($ids: [Uuid!]) {
		myOrders(where: { id_in: $ids }) {
			nodes {
				id
				reference
				vendor {
					name
				}
			}
		}
	}
`;

export const GET_ORDER = gql`
	query order($input: ID!) {
		order(input: $input) {
			id
			totalFees
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
		getMyConsumerLegals {
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