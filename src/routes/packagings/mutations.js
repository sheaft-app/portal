import gql from "graphql-tag";

export const CREATE_PACKAGING = gql`
	mutation CreatePackaging($input: CreatePackagingInput!) {
		createPackaging(input: $input) {
			id
		}
	}
`;

export const UPDATE_PACKAGING = gql`
	mutation UpdatePackaging($input: UpdatePackagingInput!) {
		updatePackaging(input: $input) {
			id
			name
			vat
			wholeSalePrice
			description
		}
	}
`;

export const DELETE_PACKAGING = gql`
	mutation DeletePackaging($input: IdInput!) {
		deletePackaging(input: $input)
	}
`;