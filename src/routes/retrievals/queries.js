import gql from "graphql-tag";

export const GET_PENDING_RETRIEVALS = gql`
	query GetDeliveries($first: Int, $last: Int, $after: String, $before: String, $orderBy: [DeliverySortInput!]) {
		deliveries(
			first: $first
			last: $last
			after: $after
			before: $before
			order: $orderBy
			where: {
				kind: { nin: [PRODUCER_TO_STORE] }
				and: [{ or: [{ status: { eq: READY } }, { status: { eq: IN_PROGRESS } }] }]
			}
		) {
			pageInfo {
				hasPreviousPage
				hasNextPage
				startCursor
				endCursor
			}
			nodes {
				id
				address {
					line1
					line2
					zipcode
					city
				}
				reference
				scheduledOn
				deliveredOn
				client {
					id
					name
				}
				purchaseOrdersCount
				purchaseOrders {
					id
					reference
					createdOn
				}
			}
		}
	}
`;

export const GET_COMPLETED_RETRIEVALS = gql`
	query GetDeliveries($first: Int, $last: Int, $after: String, $before: String, $orderBy: [DeliverySortInput!]) {
		deliveries(
			first: $first
			last: $last
			after: $after
			before: $before
			order: $orderBy
			where: { status: { eq: DELIVERED }, and: [{ kind: { nin: [PRODUCER_TO_STORE] } }] }
		) {
			pageInfo {
				hasPreviousPage
				hasNextPage
				startCursor
				endCursor
			}
			nodes {
				id
				address {
					line1
					line2
					zipcode
					city
				}
				reference
				scheduledOn
				deliveredOn
				client {
					id
					name
				}
				purchaseOrdersCount
				purchaseOrders {
					id
					reference
					createdOn
				}
			}
		}
	}
`;

export const GET_DELIVERY_DETAILS = gql`
	query Delivery($id: ID!) {
		delivery(id: $id) {
			id
			address {
				line1
				line2
				zipcode
				city
			}
			reference
			scheduledOn
			deliveredOn
			client {
				id
				name
				email
				phone
			}
			deliveryFeesWholeSalePrice
			deliveryFeesVatPrice
			deliveryFeesOnSalePrice
			productsToDeliverCount
			productsDeliveredCount
			purchaseOrdersCount
			deliveryFormUrl
			deliveryReceiptUrl
			purchaseOrders {
				id
				reference
				createdOn
			}
			products {
				id
				productId
				name
				kind
				quantity
				reference
				vat
				isReturnable
				unitWholeSalePrice
				totalProductWholeSalePrice
				totalProductOnSalePrice
				totalProductVatPrice
				returnableId
				returnableName
				returnableVat
				returnableWholeSalePrice
				totalReturnableWholeSalePrice
				totalReturnableOnSalePrice
				totalReturnableVatPrice
			}
			returnedReturnables {
				id
				returnableId
				name
				quantity
				vat
				unitWholeSalePrice
				totalWholeSalePrice
				totalOnSalePrice
				totalVatPrice
			}
		}
	}
`;
