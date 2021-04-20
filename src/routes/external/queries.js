import gql from "graphql-tag";


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
			ratings(first: 10, order_by: { createdOn: DESC }) {
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

export const GET_PRODUCER_DELIVERIES = gql`
	query GetProducerDeliveries($input: SearchProducersDeliveriesInput!) {
		getDeliveriesForProducers(input: $input) {
			id
			name
			deliveries {
				id
				kind
				closings {
					id
					from
					to
					reason
				}
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

export const GET_PRODUCER_PROFILE = gql`
query GetUserProfile($id: ID!) {
	producer(input: $id) {
		id
		name
		summary
		closings {
			id
			from
			to
			reason
		}
		address {
			line1
			line2
			city
			latitude
			longitude
			zipcode
		}
		description
		facebook
		instagram
		twitter
	}
}
`;

export const GET_PRODUCER_PRODUCTS = gql`
	query($id: ID!) {
		producerProducts(input: $id) {
	  		nodes {
				id
				name
				onSalePricePerUnit
				imageMedium
				imageSmall
				rating
				quantityPerUnit
				conditioning
				unit
				available
	  		}
		}
  	}
`
