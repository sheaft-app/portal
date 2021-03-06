import gql from "graphql-tag";

export const SEARCH_PRODUCERS = gql`
	query SearchProducers($input: SearchTermsInput!) {
		searchProducers(input: $input) {
			count
			producers {
				id
				picture
				name
				address {
					line1
					line2
					city
					latitude
					longitude
					zipcode
				}
				tags {
					name
				}
				agreement {
					id
					status
				}
			}
		}
	}
`;

export const GET_MY_BUSINESS_LOCATION = gql`
	query GetMyBusinessLocation {
		me {
			address {
				latitude
				longitude
			}
		}
	}
`;

export const GET_PRODUCER_DETAILS = gql`
	query GetProducerDetails($id: ID!) {
		producer(id: $id) {
			id
			name
			summary
			description
			picture
			email
			website
			facebook
			instagram
			phone
			closings {
				id
				from
				to
				reason
			}
			tags {
				kind
				name
			}
			address {
				line1
				line2
				city
				zipcode
				latitude
				longitude
			}
			agreement {
				id
				status
				delivery {
					id
					name
					deliveryHours {
						from
						to
						day
					}
				}
			}
			products {
				id
				name
				wholeSalePricePerUnit
				wholeSalePrice
				rating
				imageSmall
				quantityPerUnit
				unit
				conditioning
			}
		}
	}
`;

export const GET_PRODUCER_PRODUCTS = gql`
	query GetProducerProducts($companyId: ID!) {
		producer(id: $companyId) {
			products {
				id
				name
				onSalePricePerUnit
				wholeSalePricePerUnit
				picture
				wholeSalePrice
				imageSmall
				rating
				quantityPerUnit
				conditioning
				unit
				available
			}
		}
	}
`;

export const GET_AGREEMENTS = gql`
	query GetAgreements {
		agreements {
			nodes {
				id
				status
				store {
					id
				}
				producer {
					id
				}
			}
		}
	}
`;

export const GET_PRODUCER_DELIVERIES = gql`
	query GetProducerDeliveries($input: [ID!]) {
		producersDeliveries(ids: $input, kinds: [PRODUCER_TO_STORE]) {
			id
			name
			deliveries {
				id
				name
				deliveryHours {
					day
					from
					to
				}
			}
		}
	}
`;

export const GET_PRODUCER_AGREEMENTS = gql`
	query GetProducerAgreements($id: ID!) {
		producerAgreements(
			input: $id
			first: 50
			where: { status: { in: [ACCEPTED, WAITING_FOR_PRODUCER_APPROVAL, WAITING_FOR_STORE_APPROVAL] } }
		) {
			nodes {
				id
				status
			}
		}
	}
`;
