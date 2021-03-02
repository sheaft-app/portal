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
                unitOnSalePrice
                quantity
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