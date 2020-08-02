import gql from "graphql-tag";

export const SEARCH_PRODUCERS = gql`
	query SearchProducers($input: SearchTermsInput!) {
		searchProducers(input: $input) {
			id
			name
			address {
				city
				latitude
				longitude
				zipcode
			}
			tags {
				name
			}
		}
	}
`;

export const GET_PRODUCER_DETAILS = gql`
	query GetProducerDetails($id: ID!) {
		producer(input: $id) {
			id
			name
			description
			email
			phone
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
		}
	}
`;

export const GET_PRODUCER_PRODUCTS = gql`
	query GetProducerProducts($companyId: ID!) {
		producerProducts(input: $companyId) {
			nodes {
				id
				name
				wholeSalePricePerUnit
				wholeSalePrice
				rating
				quantityPerUnit
				unit
				producer {
					id
				}
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
				delivery {
					producer {
						id
					}
				}
			}
		}
	}
`;

export const GET_PRODUCER_DELIVERIES = gql`
	query GetProducerDeliveries($input: SearchProducersDeliveriesInput!) {
		getDeliveriesForProducers(input: $input) {
			id
			name
			deliveries {
				id
				kind
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

export const GET_PRODUCER_AGREEMENTS = gql`
	query GetProducerAgreements($input: ID!) {
		producerAgreements(input: $input) {
			nodes {
				id
				status
			}
		}
	}
`;
