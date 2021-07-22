import gql from "graphql-tag";

export const GET_DEFAULT_QUICK_ORDER = gql`
	query GetDefaultQuickOrder {
		quickOrders(where: { isDefault: { eq: true } }) {
			id
			products {
				quantity
				id
				name
				reference
				unitWeight
				unitWholeSalePrice
				vat
				unitVatPrice
				producer {
					id
					name
				}
				available
			}
		}
	}
`;

export const GET_QUICKORDERS = gql`
	query GetQuickOrders(
		$first: Int
		$last: Int
		$after: String
		$before: String
		$orderBy: [QuickOrderSortInput!]
		$where: QuickOrderFilterInput
	) {
		quickOrders(first: $first, last: $last, after: $after, before: $before, order: $orderBy, where: $where) {
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
					name
					createdOn
					isDefault
					productsCount
				}
			}
		}
	}
`;

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

export const GET_QUICKORDER = gql`
	query GetQuickOrder($id: ID!) {
		quickOrder(id: $id) {
			id
			name
			createdOn
			isDefault
			productsCount
			products {
				id
				name
				reference
				quantity
				quantityPerUnit
				wholeSalePricePerUnit
				onSalePricePerUnit
				vat
				vatPricePerUnit
				producer {
					id
					name
				}
				returnable {
					id
					name
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
