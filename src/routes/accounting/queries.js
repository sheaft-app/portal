import gql from "graphql-tag";

export const GET_DELIVERIES = gql`
	query GetDeliveries {
		deliveries(
			first: 50
			where: { status: { eq: DELIVERED }, and: [{ kind: { in: [PRODUCER_TO_STORE] } }, { billedOn: { eq: null } }] }
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
				billedOn
				deliveredOn
				client {
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
			reference
			billedOn
			deliveredOn
			client {
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
			productsToDeliverCount
			productsDeliveredCount
			purchaseOrdersCount
			deliveryFormUrl
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
