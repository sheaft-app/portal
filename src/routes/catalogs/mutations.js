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
				wholeSalePricePerUnit
				addedOn
			}
		}
	}
`;

export const CLONE_CATALOG = gql`
	mutation CloneCatalog($input: CloneCatalogInput!) {
		cloneCatalog(input: $input) {
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
				wholeSalePricePerUnit
				addedOn
			}
		}
	}
`;

export const UPDATE_CATALOG_PRICES = gql`
	mutation UpdateCatalogPrices($input: UpdateAllCatalogPricesInput!) {
		updateCatalogPrices(input: $input) {
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