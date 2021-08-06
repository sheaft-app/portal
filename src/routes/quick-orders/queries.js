import gql from "graphql-tag";

export const GET_QUICKORDERS = gql`
	query GetQuickOrders(
		$first: Int
		$last: Int
		$after: String
		$before: String
		$orderBy: [QuickOrderSortInput!]
		$where: QuickOrderFilterInput
	) {
		quickOrders(first: $first, last: $last, after: $after, before: $before, order: $orderBy, where: $where) {
			pageInfo {
				startCursor
				endCursor
				hasNextPage
				hasPreviousPage
			}
			edges {
				cursor
				node {
					id
					name
					createdOn
					isDefault
					productsCount
				}
			}
		}
	}
`;

export const GET_QUICKORDER = gql`
	query GetQuickOrder($id: ID!) {
		quickOrder(id: $id) {
			id
			name
			createdOn
			isDefault
			productsCount
			products {
				id
				name
				reference
				quantity
				quantityPerUnit
				wholeSalePricePerUnit
				onSalePricePerUnit
				vat
				vatPricePerUnit
				producer {
					id
					name
				}
				returnable {
					id
					name
				}
			}
		}
	}
`;

export const GET_ALL_PRODUCTS = gql`
	query GetAllProducts {
		storeOrderableProducts(first: 50) {
			nodes {
				id
				name
				reference
				unit
				conditioning
				weight
				available
				quantityPerUnit
				wholeSalePricePerUnit
				onSalePricePerUnit
				vat
				vatPricePerUnit
				returnable {
					id
					wholeSalePrice
					onSalePrice
					vatPrice
				}
				producer {
					id
					name
				}
			}
		}
	}
`;
