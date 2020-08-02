import gql from "graphql-tag";

export const GET_DEFAULT_QUICK_ORDER = gql`
	query GetDefaultQuickOrder {
		defaultQuickOrder {
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
			}
		}
	}
`;

export const GET_ALL_PRODUCTS = gql`
	query GetAllProducts {
		storeAgreementsProducts {
			nodes {
				id
				name
				reference
				unit
				quantityPerUnit
				wholeSalePricePerUnit
				vat
				vatPricePerUnit
				quantityPerUnit
				producer {
					id
					name
				}
			}
		}
	}
`;

export const GET_STORE_DELIVERIES_FOR_PRODUCERS = gql`
	query GetStoreDeliveriesForProducers($input: SearchProducersDeliveriesInput) {
		getStoreDeliveriesForProducers(input: $input) {
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
