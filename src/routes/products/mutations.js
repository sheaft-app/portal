import gql from "graphql-tag";

export const CREATE_PRODUCT = gql`
	mutation CreateProduct($input: CreateProductInput!) {
		createProduct(input: $input) {
			id
		}
	}
`;

export const UPLOAD_PRODUCTS = gql`
	mutation UploadProducts($files: [string]) {
		uploadProducts(files: $files) {
			id
		}
	}
`;

export const UPDATE_PRODUCT = gql`
	mutation UpdateProduct($input: UpdateProductInput!) {
		updateProduct(input: $input) {
			id
			reference
			onSalePricePerUnit
			wholeSalePricePerUnit
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
			vatPricePerUnit
			createdOn
			tags {
				id
				name
				kind
			}
			available
			visibleToStores
			visibleToConsumers
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
			nodes {
				id
				available
			}
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
