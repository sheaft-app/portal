import gql from "graphql-tag";

export const CREATE_PRODUCT = gql`
	mutation CreateProduct($input: CreateProductInput!) {
		createProduct(input: $input) {
			id
			reference
			name
			rating
			ratingsCount
			description
			weight
			picture
			vat
			quantityPerUnit
			conditioning
			unit
			returnable {
				id
				name
				vat
				wholeSalePrice
			}
			catalogs {
				wholeSalePricePerUnit
				addedOn
				id
				name
			}
			createdOn
			tags {
				id
				name
				kind
			}
			pictures {
				id
				position
				medium
			}
			available
			visibleTo
		}
	}
`;

export const UPDATE_PRODUCT = gql`
	mutation UpdateProduct($input: UpdateProductInput!) {
		updateProduct(input: $input) {
			id
			reference
			name
			rating
			ratingsCount
			description
			weight
			picture
			vat
			quantityPerUnit
			conditioning
			unit
			returnable {
				id
				name
				vat
				wholeSalePrice
			}
			createdOn
			tags {
				id
				name
				kind
			}
			catalogs {
				wholeSalePricePerUnit
				addedOn
				id
				name
			}
			pictures {
				id
				position
				medium
			}
			available
			visibleTo
		}
	}
`;

export const DELETE_PRODUCTS = gql`
	mutation DeleteProducts($input: DeleteProductsInput!) {
		deleteProducts(input: $input)
	}
`;

export const SET_PRODUCTS_AVAILABILITY = gql`
	mutation SetProductsAvailability($input: SetProductsAvailabilityInput!) {
		setProductsAvailability(input: $input) {
			id
			available
		}
	}
`;

export const UPDATE_PRODUCT_IMAGE = gql`
	mutation UpdateProductPicture($input: UpdateProductPictureInput!) {
		updateProductPicture(input: $input) {
			id
			name
			picture
		}
	}
`;
