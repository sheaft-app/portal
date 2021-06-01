import gql from "graphql-tag";

export const GET_CONSUMER_DETAILS = gql`
	query GetConsumerDetails {
		myConsumerProfile {
			id
			lastName
			firstName
			email
			phone
			picture
			facebook
			instagram
		}
	}
`;

export const GET_STORE_DETAILS = gql`
	query GetStoreDetails {
		myStoreProfile {
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
			openForNewBusiness
			email
			phone
			picture
			description
			summary
			facebook
			instagram
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
			pictures {
				id
				position
				large
			}
		}
	}
`;

export const GET_PRODUCER_DETAILS = gql`
	query GetProducerDetails {
		myProducerProfile {
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
			openForNewBusiness
			email
			phone
			picture
			description
			summary
			facebook
			instagram
			website
			pictures {
				id
				position
				large
			}
		}
	}
`;
