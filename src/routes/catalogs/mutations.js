import gql from "graphql-tag";

export const CREATE_CATALOG = gql`
	mutation CreateCatalog($input: CreateCatalogInput!) {
		createCatalog(input: $input) {
			id
			name
			kind
			isDefault
			available
			updatedOn
			products {
				id
				name
				reference
				onSalePrice
				onSalePricePerUnit
				vatPrice
				vatPricePerUnit
				wholeSalePrice
				wholeSalePricePerUnit
				addedOn
			}
		}
	}
`;

export const UPDATE_CATALOG = gql`
	mutation UpdateCatalog($input: UpdateCatalogInput!) {
		updateCatalog(input: $input) {
			id
			name
			kind
			isDefault
			available
			updatedOn
			products {
				id
				name
				reference
				onSalePrice
				onSalePricePerUnit
				vatPrice
				vatPricePerUnit
				wholeSalePrice
				wholeSalePricePerUnit
				addedOn
			}
		}
	}
`;

export const DELETE_CATALOGS = gql`
	mutation DeleteCatalogs($input: DeleteCatalogsInput!) {
		deleteCatalogs(input: $input)
	}
`;