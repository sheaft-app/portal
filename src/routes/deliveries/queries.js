import gql from "graphql-tag";

export const GET_DELIVERIES = gql`
	query Deliveries {
		deliveries(where: { kind_in:[PRODUCER_TO_STORE] }) {
			nodes {
				id
				name
				kind
				lockOrderHoursBeforeDelivery
				openingHours {
					day
					from
					to
				}
			}
		}
	}
`;

export const GET_DELIVERY_DETAILS = gql`
	query Delivery($id: ID!) {
		delivery(input: $id) {
			id
			name
			kind
			lockOrderHoursBeforeDelivery
			openingHours {
				day
				from
				to
			}
			address {
				line1
				city
				zipcode
			}
		}
	}
`;
