import gql from "graphql-tag";

export const SEARCH_PRODUCTS = gql`
	query SearchProducts($input: SearchTermsInput!) {
		searchProducts(input: $input) {
			count
			products {
				id
				name
				picture
				rating
				onSalePricePerUnit
				onSalePrice
				unit
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
			}
		}
	}
`;

export const GET_PRODUCT_DETAILS = gql` 
	query GetProductDetails($id: ID!) {
		product(input: $id) {
			id
			name
			description
			rating
			ratingsCount
			onSalePricePerUnit
			onSalePrice
			quantityPerUnit
			unit
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
			ratings(first: 10, order_by: { createdOn: DESC }) {
				nodes {
					user {
						shortName
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
				description
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

export const GET_PRODUCER_DELIVERIES = gql`
	query GetProducerDeliveries($input: SearchProducersDeliveriesInput) {
		getDeliveriesForProducers(input: $input) {
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
				deliveryHours(order_by: { expectedDeliveryDate: "ASC" }) {
					day
					from
					to
					expectedDeliveryDate
				}
			}
		}
	}
`;
