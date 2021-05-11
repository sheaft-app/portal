import gql from "graphql-tag";

export const GET_SELLING_POINTS = gql`
	query SellingPoints {
		deliveries(
			first: 50
			where: { kind: { nin: [PRODUCER_TO_STORE, EXTERNAL_TO_STORE, PRODUCER_TO_CONSUMER, EXTERNAL_TO_CONSUMER] }}
		) {
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
				maxPurchaseOrdersPerTimeSlot
				autoAcceptRelatedPurchaseOrder
				autoCompleteRelatedPurchaseOrder
				lockOrderHoursBeforeDelivery
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
	}
`;

export const GET_SELLING_POINT_DETAILS = gql`
	query SellingPoint($id: ID!) {
		delivery(id: $id) {
			id
			name
			kind
			available
			maxPurchaseOrdersPerTimeSlot
			autoAcceptRelatedPurchaseOrder
			autoCompleteRelatedPurchaseOrder
			lockOrderHoursBeforeDelivery
			closings {
				id
				from
				to
				reason
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
				latitude
				longitude
			}
		}
	}
`;

export const GET_BUSINESS_CLOSINGS = gql`
	query GetBusinessClosings {
		businessClosings
		{
			nodes {
				id
				from
				to
				reason
			}
		}
	}
`
