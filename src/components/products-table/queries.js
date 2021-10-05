import gql from "graphql-tag";

export const GET_DELIVERY_DETAILS = gql`
	query Delivery($id: ID!) {
		delivery(id: $id) {
			id
			reference
			status
			kind
			scheduledOn
			deliveredOn
			deliveryFeesWholeSalePrice
			deliveryFeesVatPrice
			deliveryFeesOnSalePrice
			purchaseOrders {
				id
				status
				reference
				comment
				products {
					id
					name
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
				preparedProducts {
					id
					name
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
					batches {
						id
						number
						dlc
						ddm
					}
				}
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


export const GET_PURCHASE_ORDER_DETAILS = gql`
	query GetMyOrderDetails($id: ID!) {
		purchaseOrder(id: $id) {
			id
			status
			reference
			comment
			preparedProducts {
				id
				productId
				name
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
				batches {
					id
					number
					dlc
					ddm
				}
			}
			expectedDelivery {
				deliveryFeesWholeSalePrice
				deliveryFeesVatPrice
				deliveryFeesOnSalePrice
			}
			delivery{
				id
				reference
				status
				kind
				scheduledOn
				deliveredOn
			}
			products {
				id
				name
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
		}
	}
`;