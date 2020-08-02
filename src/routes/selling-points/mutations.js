import gql from "graphql-tag";

export const CREATE_SELLING_POINT = gql`
	mutation CreateSellingPoint($input: CreateDeliveryModeInput!) {
		createDeliveryMode(input: $input) {
			id
			name
			kind
			lockOrderHoursBeforeDelivery
			address {
				line1
				city
				zipcode
			}
			openingHours {
				day
				from
				to
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
			address {
				line1
				city
				zipcode
			}
			openingHours {
				day
				from
				to
			}
		}
	}
`;

export const DELETE_SELLING_POINT = gql`
	mutation DeleteSellingPoint($input: IdInput!) {
		deleteDeliveryMode(input: $input)
	}
`;