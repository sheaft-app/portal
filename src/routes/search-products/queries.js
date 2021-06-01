import gql from "graphql-tag";

export const SEARCH_PRODUCTS = gql`
	query SearchProducts($input: SearchProductsInput!) {
		searchProducts(input: $input) {
			count
			products {
				id
				name
				picture
				imageMedium
				imageSmall
				rating
				wholeSalePricePerUnit
				onSalePricePerUnit
				wholeSalePrice
				onSalePrice
				unit
				conditioning
				quantityPerUnit
				tags {
					name
				}
				producer {
					id
					name
					address {
						city
						latitude
						longitude
						zipcode
					}
				}
				isReturnable
				available
			}
		}
	}
`;

export const GET_PRODUCT_DETAILS = gql`
	query GetProductDetails($id: ID!) {
		product(id: $id) {
			id
			name
			description
			rating
			ratingsCount
			wholeSalePricePerUnit
			onSalePricePerUnit
			wholeSalePrice
			onSalePrice
			quantityPerUnit
			available
			unit
			conditioning
			tags {
				name
			}
			returnable {
				id
				name
				onSalePrice
			}
			currentUserHasRatedProduct
			picture
			pictures {
				id
				large
				position
			}
			ratings(first: 10, order: [{ createdOn: DESC }]) {
				nodes {
					user {
						name
						picture
					}
					comment
					createdOn
					value
				}
			}
			producer {
				id
				name
				summary
				picture
				address {
					city
					line1
					line2
					zipcode
					latitude
					longitude
				}
			}
		}
	}
`;

export const GET_PRODUCER_PRODUCTS = gql`
	query ($id: ID!) {
		producer(id: $id) {
			products {
				id
				name
				onSalePricePerUnit
				wholeSalePricePerUnit
				picture
				rating
				quantityPerUnit
				conditioning
				unit
				available
			}
		}
	}
`;

export const GET_PRODUCER_DELIVERIES = gql`
	query GetProducerDeliveries($input: [ID!]) {
		nextProducersDeliveries(ids: $input, kinds: [FARM, MARKET, COLLECTIVE]) {
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

export const GET_PRODUCER_NAME = gql`
	query GetProducerName($id: ID!) {
		producer(id: $id) {
			id
			name
		}
	}
`;

export const SUGGEST_PRODUCER = gql`
	query SuggestProducer($input: SearchTermsInput!) {
		suggestProducers(input: $input) {
			id
			name
			address {
				zipcode
				city
			}
		}
	}
`;
