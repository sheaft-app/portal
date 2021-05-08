import gql from "graphql-tag";

export const GET_DELIVERIES = gql`
	query Deliveries {
		deliveries(
			first: 50
			where: { kkind: { in: [PRODUCER_TO_STORE] }}) {
			pageInfo{
				hasPreviousPage
				hasNextPage
				startCursor
				endCursor
			}
			nodes {
				id
				name
				kind
				available
				lockOrderHoursBeforeDelivery
				autoAcceptRelatedPurchaseOrder
				autoCompleteRelatedPurchaseOrder
				deliveryHours {
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
		delivery(id: $id) {
			id
			name
			kind
			available
			lockOrderHoursBeforeDelivery
			autoAcceptRelatedPurchaseOrder
			autoCompleteRelatedPurchaseOrder
			deliveryHours {
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
