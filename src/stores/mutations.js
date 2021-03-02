import gql from "graphql-tag";

export const CREATE_CONSUMER_ORDER = gql`
	mutation createOrder($input: CreateOrderInput!) {
		createOrder(input: $input) {
			id
			donation
			productsCount
			totalOnSalePrice
			totalPrice
			totalReturnableOnSalePrice
			totalFees
			returnablesCount
			user {
				id
			}
			products {
                id
				name
				quantity
				unitOnSalePrice
                producer {
                    name
                    address {
						line1
						line2
						city
						zipcode
                        latitude
						longitude
                    }
                }
            }
		}
	}
`;

export const UPDATE_CONSUMER_ORDER = gql`
	mutation updateOrder($input: UpdateOrderInput!) {
		updateOrder(input: $input) {
			id
			donation
			productsCount
			totalFees
			totalPrice
			totalOnSalePrice
			totalReturnableOnSalePrice
			returnablesCount
			user {
				id
			}
			products {
                id
				name
				quantity
				unitOnSalePrice
                producer {
                    name
                    address {
                        line1
						line2
						city
						zipcode
                        latitude
                        longitude
                    }
                }
            }
		}
	}
`;
