import gql from "graphql-tag";

export const CREATE_CONSUMER_ORDER = gql`
	mutation createOrder($input: CreateOrderInput!) {
		createConsumerOrder(input: $input) {
			id
			totalFees
			totalOnSalePrice
			totalReturnableOnSalePrice
			totalPrice
			status
			returnablesCount
			donation
			productsCount
			deliveries {
				expectedDelivery {
					day
					from
					to
					expectedDeliveryDate
				}
				deliveryMode {
					id
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
			products {
				id
				name
				unitOnSalePrice
				quantity
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
		updateConsumerOrder(input: $input) {
			id
			totalFees
			totalOnSalePrice
			totalReturnableOnSalePrice
			totalPrice
			status
			returnablesCount
			donation
			productsCount
			deliveries {
				expectedDelivery {
					day
					from
					to
					expectedDeliveryDate
				}
				deliveryMode {
					id
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
			products {
				id
				name
				unitOnSalePrice
				quantity
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
