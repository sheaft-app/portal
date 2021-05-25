import gql from "graphql-tag";

export const GET_DELIVERIES = gql`
	query Deliveries {
		deliveries(
			first: 50
			where: { kind: { in: [PRODUCER_TO_STORE] }}) {
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
				maxPurchaseOrdersPerTimeSlot
				deliveryHours {
					day
					from
					to
				}
				closings {
					id
					from
					to
					reason
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
			maxPurchaseOrdersPerTimeSlot
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
			closings {
				id
				from
				to
				reason
			}
		}
	}
`;
