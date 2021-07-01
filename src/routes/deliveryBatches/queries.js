import gql from "graphql-tag";

export const GET_DELIVERY_BATCHES = gql`
	query GetDeliveryBatches {
		deliveryBatches(where: { status: { in: [WAITING, READY, IN_PROGRESS]}}) {
			edges {
				cursor
				node {
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
						firstName
					}
					status
					name
					id
					purchaseOrdersCount
					deliveriesCount
				}
			}
			pageInfo {
				hasPreviousPage
				hasNextPage
				startCursor
				endCursor
			}
		}
	}
`;

export const GET_DELIVERY_BATCHES_HISTORY = gql`
	query GetDeliveryBatches {
		deliveryBatches(where: { status: { in: [COMPLETED, CANCELLED, PARTIAL]}}) {
			edges {
				cursor
				node {
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
						firstName
					}
					status
					name
					id
					purchaseOrdersCount
					deliveriesCount
				}
			}
			pageInfo {
				hasPreviousPage
				hasNextPage
				startCursor
				endCursor
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
			returnedProductsCount
			returnedReturnablesCount
			deliveries {
				id
				position
				client
				clientId
				status
				address {
					latitude
					longitude
					line1
					line2
					zipcode
					city
				}
				productsToDeliverCount
				purchaseOrdersCount
				products {
					id
					name
					quantity
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
				address {
					latitude
					longitude
				}
			}
			status
			name
			id
			productsToDeliverCount
			deliveriesCount
		}
	}
`;

export const GET_RETURNABLES = gql`
	query Returnables {
		returnables {
			nodes {
				id
				name
				vat
				wholeSalePrice
			}
		}
	}
`;