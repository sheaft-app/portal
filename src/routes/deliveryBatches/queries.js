import gql from "graphql-tag";

export const GET_DELIVERY_BATCHES = gql`
	query GetDeliveryBatches {
		deliveryBatches {
			nodes {
				day
				from
				scheduledOn
				deliveries {
					id
					position
					client
				}
				assignedTo {
					name
				}
				status
				name
				id
				productsToDeliverCount
				deliveriesCount
			}
		}
	}
`;

export const GET_AVAILABLE_DELIVERY_BATCHES = gql`
	query GetAvailableDeliveryBatches($includeProcessingPurchaseOrders: Boolean!) {
		availableDeliveryBatches(includeProcessingPurchaseOrders: $includeProcessingPurchaseOrders) {
			name
			day
			from
			to
			expectedDeliveryDate
			purchaseOrdersCount
			clientsCount
			clients {
				id
				name
				position
				purchaseOrders {
					id
					productsCount
					expectedDeliveryDate
					totalWholeSalePrice
				}
			}
		}
	}
`;

export const GET_DELIVERY_BATCH_DETAILS = gql`
	query GetDeliveryBatchDetails($id: ID!) {
		deliveryBatch(id: $id) {
			day
			from
			scheduledOn
			deliveries {
				id
				position
				client
				clientId
				address {
					line1
					line2
					zipcode
					city
				}
				purchaseOrders {
					id
					totalWholeSalePrice
					productsCount
					createdOn
				}
			}
			assignedTo {
				name
			}
			status
			name
			id
			productsToDeliverCount
			deliveriesCount
		}
	}
`;