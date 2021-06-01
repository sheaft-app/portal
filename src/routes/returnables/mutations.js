import gql from "graphql-tag";

export const CREATE_RETURNABLE = gql`
	mutation CreateReturnable($input: CreateReturnableInput!) {
		createReturnable(input: $input) {
			id
			name
			vat
			wholeSalePrice
			onSalePrice
		}
	}
`;

export const UPDATE_RETURNABLE = gql`
	mutation UpdateReturnable($input: UpdateReturnableInput!) {
		updateReturnable(input: $input) {
			id
			name
			vat
			wholeSalePrice
			onSalePrice
		}
	}
`;

export const DELETE_RETURNABLE = gql`
	mutation DeleteReturnable($input: DeleteReturnableInput!) {
		deleteReturnable(input: $input)
	}
`;
