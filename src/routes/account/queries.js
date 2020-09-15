import gql from "graphql-tag";

export const GET_CONSUMER_DETAILS = gql`
	query GetConsumerDetails($id: ID!) {
		consumer(input: $id) {
			id
			address {
				department{
					code
					name
				}
			}
			lastName
			firstName
			name
			email
			phone
			picture
			anonymous
		}
	}
`;

export const GET_STORE_DETAILS = gql`
	query GetStoreDetails($id: ID!) {
		store(input: $id) {
			id
			address {
				line1
				line2
				zipcode
				city
				country
				latitude
				longitude
			}
			lastName
			firstName
			name
			siret
			vatIdentifier
			openForNewBusiness
			description
			email
			phone
			picture
			tags {
				id
				kind
				name
			}
			openingHours {
				day
				from
				to
			}
		}
	}
`;

export const GET_PRODUCER_DETAILS = gql`
	query GetProducerDetails($id: ID!) {
		producer(input: $id) {
			id
			address {
				line1
				line2
				zipcode
				city
				country
				latitude
				longitude
			}
			lastName
			firstName
			name
			siret
			vatIdentifier
			openForNewBusiness
			description
			email
			phone
			picture
			tags {
				id
				kind
				name
			}
		}
	}
`;