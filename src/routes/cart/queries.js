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