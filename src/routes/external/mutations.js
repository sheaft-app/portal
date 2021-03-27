import gql from "graphql-tag";

export const RATE_PRODUCT = gql`
	mutation rateProduct($input: RateProductInput!) {
		rateProduct(input: $input) {
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
