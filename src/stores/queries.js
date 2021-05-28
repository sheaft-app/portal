import gql from "graphql-tag";

export const GET_CART = gql`
    query order($input: ID!) {
        order(id: $input) {
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

export const GET_MOST_RECENT_CART = gql`
    query GetMostRecentCart {
        currentOrder {
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