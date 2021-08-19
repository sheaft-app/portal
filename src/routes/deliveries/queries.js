import gql from "graphql-tag";

export const GET_DELIVERIES = gql`
	query Deliveries {
		deliveryModes(first: 50, where: { kind: { in: [PRODUCER_TO_STORE] } }) {
			pageInfo {
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
				deliveryFeesWholeSalePrice
				deliveryFeesMinPurchaseOrdersAmount
				acceptPurchaseOrdersWithAmountGreaterThan
				applyDeliveryFeesWhen
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
		deliveryMode(id: $id) {
			id
			name
			kind
			available
			lockOrderHoursBeforeDelivery
			autoAcceptRelatedPurchaseOrder
			maxPurchaseOrdersPerTimeSlot
			autoCompleteRelatedPurchaseOrder
			deliveryFeesWholeSalePrice
			deliveryFeesMinPurchaseOrdersAmount
			acceptPurchaseOrdersWithAmountGreaterThan
			applyDeliveryFeesWhen
			agreements {
				id
				position
				store {
					id
					name
					address {
						line1
						line2
						city
						zipcode
					}
				}
			}
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
