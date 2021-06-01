import gql from "graphql-tag";

export const CREATE_SELLING_POINT = gql`
	mutation CreateSellingPoint($input: CreateDeliveryModeInput!) {
		createDeliveryMode(input: $input) {
			id
			name
			kind
			available
			maxPurchaseOrdersPerTimeSlot
			autoAcceptRelatedPurchaseOrder
			autoCompleteRelatedPurchaseOrder
			lockOrderHoursBeforeDelivery
			closings {
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
			}
		}
	}
`;

export const UPDATE_SELLING_POINT = gql`
	mutation UpdateSellingPoint($input: UpdateDeliveryModeInput!) {
		updateDeliveryMode(input: $input) {
			id
			name
			kind
			available
			maxPurchaseOrdersPerTimeSlot
			autoAcceptRelatedPurchaseOrder
			autoCompleteRelatedPurchaseOrder
			lockOrderHoursBeforeDelivery
			closings {
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
			}
		}
	}
`;

export const DELETE_SELLING_POINT = gql`
	mutation DeleteSellingPoint($input: DeleteDeliveryModeInput!) {
		deleteDeliveryMode(input: $input)
	}
`;

export const SET_SELLING_POINT_AVAILABILITY = gql`
	mutation SetDeliveryModesAvailability($input: SetDeliveryModesAvailabilityInput!) {
		setDeliveryModesAvailability(input: $input) {
			id
			available
		}
	}
`;

export const UPDATE_BUSINESS_CLOSINGS = gql`
	mutation UpdateBusinessClosings($input: UpdateOrCreateBusinessClosingsInput!) {
		updateOrCreateBusinessClosings(input: $input) {
			id
			from
			to
			reason
		}
	}
`;
