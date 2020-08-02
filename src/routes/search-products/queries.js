import gql from "graphql-tag";

export const SEARCH_PRODUCTS = gql`
	query SearchProducts($input: SearchTermsInput!) {
		searchProducts(input: $input) {
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
			packaged
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
			packaging {
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
