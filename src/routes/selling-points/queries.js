import gql from "graphql-tag";

export const GET_SELLING_POINTS = gql`
	query SellingPoints {
		deliveries(
			first: 50
			where: { kind_not_in: [PRODUCER_TO_STORE, EXTERNAL_TO_STORE, PRODUCER_TO_CONSUMER, EXTERNAL_TO_CONSUMER] }
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
	}
`;

export const GET_SELLING_POINT_DETAILS = gql`
	query SellingPoint($id: ID!) {
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
				latitude
				longitude
			}
		}
	}
`;
