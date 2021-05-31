import gql from "graphql-tag";

export const SEARCH_STORES = gql`
	query SearchStores($input: SearchTermsInput!) {
		searchStores(input: $input) {
			count
			stores {
				id
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
				agreement{
					id
					status
				}
			}
		}
	}
`;

export const GET_STORE_DETAILS = gql`
	query GetStoreDetails($id: ID!) {
		store(id: $id) {
			id
			name
			email
			phone
			website
			facebook
			instagram
			tags {
				kind
				name
			}
			openingHours {
				day
				from
				to
			}
			agreement{
				id
				status
			}
			summary
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

export const GET_DELIVERIES = gql`
	query GetDeliveries {
		deliveries(first: 50, where: { kind: { in: [PRODUCER_TO_STORE] }}) {
			nodes {
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

export const GET_CATALOGS = gql`
	query GetCatalogs {
		catalogs(where: { kind: { in: [STORES] }}, first:50) {
			nodes {
				id
				name
				kind
			}
		}
	}
`;
