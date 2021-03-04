import gql from "graphql-tag";

export const GET_CART = gql`
    query order($input: ID!) {
        order(input: $input) {
            id
            totalFees
            status
            totalOnSalePrice
            totalPrice
            donation
            productsCount
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
            totalPrice
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