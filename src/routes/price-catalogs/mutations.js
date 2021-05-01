import gql from "graphql-tag";

export const CREATE_CATALOG = gql`
	mutation CreateCatalog($input: CreateCatalogInput!) {
		createCatalog(input: $input) {
			id
		}
	}
`;

export const UPDATE_CATALOG = gql`
	mutation UpdateCatalog($input: UpdateCatalogInput!) {
		updateCatalog(input: $input) {
			id
		}
	}
`;

export const DELETE_CATALOGS = gql`
	mutation DeleteCatalogs($input: DeleteCatalogsInput!) {
		deleteCatalogs(input: $input)
	}
`;

export const UPDATE_CATALOG_PRODUCTS = gql`
	mutation UpdateCatalogProducts($input: AddOrUpdateProductsToCatalogInput!) {
		addOrUpdateProductsToCatalog(input: $input) {
			id
		}
	}
`

export const REMOVE_CATALOG_PRODUCTS = gql`
	mutation RemoveCatalogProducts($input: RemoveProductsFromCatalogInput!) {
		removeProductsFromCatalog(input: $input) {
			id
		}
	}
`