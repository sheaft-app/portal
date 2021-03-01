import gql from "graphql-tag";

export const GET_CART = gql`
    query order($input: ID!) {
        order(input: $input) {
            id
            totalFees
            status
            totalOnSalePrice
            productsCount
            totalPrice
            products {
                id
                name
                producer {
                    name
                    address {
                        latitude
                        longitude
                    }
                }
            }
        }
    }
`;