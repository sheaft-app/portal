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
		producer(input: $id) {
			id
			name
			summary
			description
			picture
			email
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
				imageSmall
				rating
				quantityPerUnit
				unit
				conditioning
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
	query GetProducerAgreements($id: ID!) {
		producerAgreements(
			input: $id
			first: 50
			where: {
				status_in: [
					ACCEPTED
					WAITING_FOR_PRODUCER_APPROVAL
					WAITING_FOR_STORE_APPROVAL
				]
			}) {
			nodes {
				id
				status
			}
		}
	}
`;
