import gql from "graphql-tag";

export const GET_PURCHASE_QUICKORDERS = gql`
	query GetPurchaseQuickOrders {
		quickOrders(first: 50) {
			nodes {
				id
				name
				createdOn
				isDefault
				productsCount
				products {
					id
					name
					reference
					unit
					quantity
					conditioning
					weight
					available
					quantityPerUnit
					wholeSalePricePerUnit
					onSalePricePerUnit
					onSalePrice
					wholeSalePrice
					vat
					vatPricePerUnit
					returnable {
						wholeSalePrice
						onSalePrice
						vatPrice
						vat
					}
					producer {
						id
						name
					}
				}
			}
		}
	}
`;

export const GET_ALL_PRODUCTS = gql`
	query GetAllProducts {
		storeOrderableProducts(first: 50) {
			nodes {
				id
				name
				reference
				unit
				conditioning
				weight
				available
				quantityPerUnit
				wholeSalePricePerUnit
				onSalePricePerUnit
				vat
				vatPricePerUnit
				returnable {
					wholeSalePrice
					onSalePrice
					vatPrice
					vat
				}
				producer {
					id
					name
				}
			}
		}
	}
`;

export const GET_STORE_DELIVERIES_FOR_PRODUCERS = gql`
	query GetStoreDeliveriesForProducers($input: [ID!]) {
		nextProducersDeliveries(ids: $input, kinds: [PRODUCER_TO_STORE]) {
			id
			name
			deliveries {
				id
				kind
				address {
					city
					line1
					line2
					zipcode
					latitude
					longitude
				}
				deliveryFeesWholeSalePrice
				deliveryFeesVatPrice
				deliveryFeesOnSalePrice
				deliveryFeesMinPurchaseOrdersAmount
				acceptPurchaseOrdersWithAmountGreaterThan
				applyDeliveryFeesWhen
				deliveryHours {
					day
					from
					to
					expectedDeliveryDate
				}
			}
		}
	}
`;
