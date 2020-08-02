import gql from "graphql-tag";

export const RATE_PRODUCT = gql`
	mutation rateProduct($input: RateProductInput!) {
		rateProduct(input: $input) {
			id
			name
			description
			rating
			ratingsCount
			currentUserHasRatedProduct
			onSalePricePerUnit
			quantityPerUnit
			unit
			onSalePrice
			tags {
				id
				name
				kind
			}
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
				name
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
