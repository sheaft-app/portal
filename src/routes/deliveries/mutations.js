import gql from "graphql-tag";

export const CREATE_DELIVERY = gql`
	mutation CreateSellingPoint($input: CreateDeliveryModeInput!) {
		createDeliveryMode(input: $input) {
			id
			name
			kind
			lockOrderHoursBeforeDelivery
			maxPurchaseOrdersPerTimeSlot
			autoAcceptRelatedPurchaseOrder
			autoCompleteRelatedPurchaseOrder
			address {
				line1
				city
				zipcode
			}
			available
			deliveryHours {
				day
				from
				to
			}
		}
	}
`;

export const UPDATE_DELIVERY = gql`
	mutation UpdateDelivery($input: UpdateDeliveryModeInput!) {
		updateDeliveryMode(input: $input) {
			id
			name
			kind
			lockOrderHoursBeforeDelivery
			maxPurchaseOrdersPerTimeSlot
			autoAcceptRelatedPurchaseOrder
			autoCompleteRelatedPurchaseOrder
			address {
				line1
				city
				zipcode
			}
			available
			deliveryHours {
				day
				from
				to
			}
		}
	}
`;

export const SET_DELIVERY_AVAILABILITY = gql`
	mutation SetDeliveryAvailability($input: SetDeliveryModesAvailabilityInput!) {
		setDeliveryModesAvailability(input: $input) {
			id
			available
		}
	}
`;

export const DELETE_DELIVERY = gql`
	mutation DeleteSellingPoint($input: DeleteDeliveryModeInput!) {
		deleteDeliveryMode(input: $input)
	}
`;
