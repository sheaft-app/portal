import gql from "graphql-tag";

export const CREATE_BUSINESS_ORDER = gql`
	mutation CreatePurchaseOrders($input: CreatePurchaseOrdersInput!) {
		createBusinessOrder(input: $input) {
			id
		}
	}
`;

export const CREATE_QUICKORDER = gql`
	mutation CreateQuickOrder($input: CreateQuickOrderInput!) {
		createQuickOrder(input: $input) {
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

export const UPDATE_QUICKORDER = gql`
	mutation UpdateQuickOrder($input: UpdateQuickOrderInput!) {
		updateQuickOrder(input: $input) {
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

export const DELETE_QUICKORDERS = gql`
	mutation DeleteQuickOrders($input: DeleteQuickOrdersInput!) {
		deleteQuickOrders(input: $input)
	}
`;
