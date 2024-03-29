import gql from "graphql-tag";

export const GET_PRODUCT_DETAILS = gql`
	query GetProductDetails($id: ID!) {
		product(id: $id) {
			id
			name
			description
			rating
			ratingsCount
			wholeSalePricePerUnit
			onSalePricePerUnit
			onSalePrice
			quantityPerUnit
			available
			unit
			conditioning
			tags {
				id
				name
			}
			returnable {
				id
				name
				onSalePrice
			}
			currentUserHasRatedProduct
			picture
			pictures {
				id
				position
				large
			}
			ratings(first: 10, order: { createdOn: DESC }) {
				nodes {
					user {
						id
						name
						picture
					}
					comment
					createdOn
					value
				}
			}
			producer {
				id
				name
				summary
				picture
				address {
					city
					line1
					line2
					zipcode
					latitude
					longitude
				}
			}
			recalls {
				id
				name
				createdOn
			}
		}
	}
`;

export const GET_PRODUCER_DELIVERIES = gql`
	query GetProducerDeliveries($input: [ID!]) {
		nextProducersDeliveries(ids: $input, kinds: [FARM, MARKET, COLLECTIVE]) {
			id
			name
			deliveries {
				id
				kind
				closings {
					id
					from
					to
					reason
				}
				address {
					city
					line1
					line2
					zipcode
					latitude
					longitude
				}
				deliveryHours {
					day
					from
					to
					expectedDeliveryDate
				}
			}
		}
	}
`;

export const GET_PRODUCER_PROFILE = gql`
	query GetProducerProfile($id: ID!) {
		producer(id: $id) {
			id
			name
			picture
			pictures {
				id
				position
				large
			}
			summary
			closings {
				id
				from
				to
				reason
			}
			address {
				line1
				line2
				city
				latitude
				longitude
				zipcode
			}
			description
			facebook
			instagram
			twitter
			website
			products {
				id
				name
				onSalePricePerUnit
				wholeSalePricePerUnit
				imageMedium
				imageSmall
				rating
				quantityPerUnit
				conditioning
				unit
				available
			}
			stores {
				id
				name
				picture
				address {
					line1
					line2
					city
					latitude
					longitude
					zipcode
				}
			}
			recalls {
				id
				name
				createdOn
			}
		}
	}
`;

export const GET_STORE_PROFILE = gql`
	query GetStoreProfile($id: ID!) {
		store(id: $id) {
			id
			name
			picture
			pictures {
				id
				position
				large
			}
			summary
			closings {
				id
				from
				to
				reason
			}
			address {
				line1
				line2
				city
				latitude
				longitude
				zipcode
			}
			description
			facebook
			instagram
			twitter
			website
			openingHours {
				day
				from
				to
			}
			tags {
				id
				name
			}
			producers {
				id
				name
				picture
				address {
					line1
					line2
					city
					latitude
					longitude
					zipcode
				}
			}
		}
	}
`;

export const GET_PRODUCER_PRODUCTS = gql`
	query ($id: ID!) {
		producer(id: $id) {
			id
			products {
				id
				name
				onSalePricePerUnit
				wholeSalePricePerUnit
				picture
				rating
				quantityPerUnit
				conditioning
				unit
				available
			}
		}
	}
`;

export const GET_RECALL_CLIENTS = gql`
	query GetRecall($id: ID!) {
		recall(id: $id) {
			id
			name
			status
			comment
			createdOn
			saleStartedOn
			saleEndedOn
			productsCount
			batchesCount
			clientsCount
			producer {
				id
				name
				phone
				email
			}
			products {
				id
				name
				reference
				picture
			}
			batches {
				id
				number
				dlc
				ddm
			}
			clients {
				id
				name
				email
			}
		}
	}
`;

export const GET_RECALL = gql`
	query GetRecall($id: ID!) {
		recall(id: $id) {
			id
			name
			status
			comment
			createdOn
			saleStartedOn
			saleEndedOn
			productsCount
			batchesCount
			userAffected
			products {
				id
				name
				reference
				picture
			}
			batches {
				id
				number
				dlc
				ddm
			}
			producer {
				id
				name
				email
				phone
			}
		}
	}
`;

export const GET_RECALL_ANONYMOUS = gql`
	query GetRecall($id: ID!) {
		recall(id: $id) {
			id
			name
			status
			comment
			createdOn
			saleStartedOn
			saleEndedOn
			productsCount
			batchesCount
			userAffected
			products {
				id
				name
				reference
				picture
			}
			batches {
				id
				number
				dlc
				ddm
			}
			producer {
				id
				name
			}
		}
	}
`;
