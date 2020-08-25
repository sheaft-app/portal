import gql from "graphql-tag";

export const CREATE_SELLING_POINT = gql`
	mutation CreateSellingPoint($input: CreateDeliveryModeInput!) {
		createDeliveryMode(input: $input) {
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

export const UPDATE_SELLING_POINT = gql`
	mutation UpdateSellingPoint($input: UpdateDeliveryModeInput) {
		updateDeliveryMode(input: $input) {
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

export const DELETE_SELLING_POINT = gql`
	mutation DeleteSellingPoint($input: IdInput!) {
		deleteDeliveryMode(input: $input)
	}
`;