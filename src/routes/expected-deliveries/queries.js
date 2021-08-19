import gql from "graphql-tag";

export const GET_PENDING_DELIVERIES = gql`
	query GetDeliveries($first: Int, $last: Int, $after: String, $before: String, $orderBy: [DeliverySortInput!]) {
		deliveries(
			first: $first
			last: $last
			after: $after
			before: $before
			order: $orderBy
			where: {
				kind: { in: [PRODUCER_TO_STORE] }
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
				reference
				scheduledOn
				deliveredOn
				producer {
					id
					name
				}
				purchaseOrdersCount
			}
		}
	}
`;

export const GET_COMPLETED_DELIVERIES = gql`
	query GetDeliveries($first: Int, $last: Int, $after: String, $before: String, $orderBy: [DeliverySortInput!]) {
		deliveries(
			first: $first
			last: $last
			after: $after
			before: $before
			order: $orderBy
			where: { status: { eq: DELIVERED }, and: [{ kind: { in: [PRODUCER_TO_STORE] } }] }
		) {
			pageInfo {
				hasPreviousPage
				hasNextPage
				startCursor
				endCursor
			}
			nodes {
				id
				reference
				scheduledOn
				deliveredOn
				producer {
					id
					name
				}
				purchaseOrdersCount
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
			producer {
				id
				name
				email
				phone
				address {
					line1
					line2
					zipcode
					city
				}
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
