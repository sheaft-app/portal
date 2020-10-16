import gql from "graphql-tag";

export const SEARCH_STORES = gql`
	query SearchStores($input: SearchTermsInput!) {
		searchStores(input: $input) {
			count
			stores {
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
	}
`;

export const GET_STORE_DETAILS = gql`
	query GetStoreDetails($id: ID!) {
		store(input: $id) {
			id
			name
			email
			phone
			tags {
				kind
				name
			}
			openingHours {
				day
				from
				to
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

export const GET_MY_BUSINESS_LOCATION = gql`
	query GetMyBusinessLocation {
		myBusiness {
			address {
				latitude
				longitude
			}
		}
	}
`;

export const GET_STORE_AGREEMENTS = gql`
	query GetStoreAgreements($id: ID!) {
		storeAgreements(
			input: $id
			first: 50
			where: {
				status_in: [
					ACCEPTED
					WAITING_FOR_PRODUCER_APPROVAL
					WAITING_FOR_STORE_APPROVAL
				]
			}
		) {
			nodes {
				id
				status
			}
		}
	}
`;

export const GET_DELIVERIES = gql`
	query GetDelivery {
		deliveries(first: 50, where: { kind_in: [PRODUCER_TO_STORE] }) {
			nodes {
				id
				kind
				openingHours {
					day
					from
					to
				}
			}
		}
	}
`;
