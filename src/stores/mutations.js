import gql from "graphql-tag";

export const CREATE_CONSUMER_ORDER = gql`
	mutation createOrder($input: CreateOrderInput!) {
		createOrder(input: $input) {
			id
			productsCount
			totalOnSalePrice
			totalPrice
			donation
            totalFees
			totalReturnableOnSalePrice
			deliveries {
                expectedDelivery {
                    day
                    from
                    to
                    expectedDeliveryDate
                }
                id
                deliveryMode {
					kind
					producer {
						id
						name
					}
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
			totalFees
			returnablesCount
			products {
                id
				name
				quantity
				unitOnSalePrice
                producer {
					id
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
			productsCount
			totalOnSalePrice
			totalPrice
			donation
            totalFees
			totalReturnableOnSalePrice
			deliveries {
                expectedDelivery {
                    day
                    from
                    to
                    expectedDeliveryDate
                }
                id
                deliveryMode {
					kind
					producer {
						id
						name
					}
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
			totalReturnableOnSalePrice
			returnablesCount
			products {
                id
				name
				quantity
				unitOnSalePrice
                producer {
					id
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
