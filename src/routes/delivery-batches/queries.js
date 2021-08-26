import gql from "graphql-tag";

export const GET_DELIVERY_BATCHES = gql`
	query GetDeliveryBatches {
		deliveryBatches(where: { status: { in: [WAITING, READY, IN_PROGRESS] } }) {
			edges {
				cursor
				node {
					day
					deliveryFormsUrl
					from
					scheduledOn
					startedOn
					completedOn
					deliveries {
						id
						position
						client {
							id
							name
						}
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
	query GetDeliveryBatches(
		$first: Int
		$last: Int
		$after: String
		$before: String
		$orderBy: [DeliveryBatchSortInput!]
	) {
		deliveryBatches(
			first: $first
			last: $last
			after: $after
			before: $before
			order: $orderBy
			where: { status: { in: [COMPLETED, PARTIAL] } }
		) {
			edges {
				cursor
				node {
					day
					from
					scheduledOn
					startedOn
					completedOn
					deliveriesCount
					deliveries {
						id
						position
						client {
							id
							name
						}
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

export const GET_COMPLETED_ORDERS = gql`
	query GetCompletedOrders {
		purchaseOrders(
			first: 50
			where: { and: [{ deliveryId: { eq: null } }, { status: { in: [COMPLETED] } }] }
		) {
			pageInfo {
				startCursor
				endCursor
				hasNextPage
				hasPreviousPage
			}
			edges {
				cursor
				node {
					id
					totalOnSalePrice
					totalWholeSalePrice
					totalVatPrice
					reference
					productsCount
					expectedDelivery {
						kind
						name
						expectedDeliveryDate
						from
						to
					}
					createdOn
					sender {
						id
						name
					}
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
			productsToDeliverCount
			productsDeliveredCount
			completedOn
			brokenProductsCount
			missingProductsCount
			deliveryFormsUrl
			returnedReturnablesCount
			deliveries {
				id
				position
				client {
					id
					name
				}
				deliveryFormUrl
				comment
				status
				address {
					latitude
					longitude
					line1
					line2
					zipcode
					city
				}
				productsDeliveredCount
				productsToDeliverCount
				returnedReturnablesCount
				purchaseOrdersCount
				products {
					id
					productId
					name
					quantity
					kind
				}
				purchaseOrders {
					id
					reference
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
