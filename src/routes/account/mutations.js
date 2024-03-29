import gql from "graphql-tag";

export const UPDATE_CONSUMER = gql`
	mutation UpdateConsumer($input: UpdateConsumerInput!) {
		updateConsumer(input: $input) {
			id
			lastName
			firstName
			email
			phone
			picture
		}
	}
`;

export const UPDATE_STORE = gql`
	mutation UpdateStore($input: UpdateStoreInput!) {
		updateStore(input: $input) {
			id
			lastName
			firstName
			name
			openForNewBusiness
			email
			phone
			picture
			address {
				line1
				line2
				zipcode
				city
				country
				latitude
				longitude
			}
			openingHours {
				day
				from
				to
			}
			pictures {
				id
				position
				medium
			}
		}
	}
`;

export const UPDATE_PRODUCER = gql`
	mutation UpdateProducer($input: UpdateProducerInput!) {
		updateProducer(input: $input) {
			id
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
			address {
				line1
				line2
				zipcode
				city
				country
				latitude
				longitude
			}
			pictures {
				id
				position
				medium
			}
		}
	}
`;

export const UPDATE_USER_PICTURE = gql`
	mutation UpdateUserPicture($input: UpdateUserPictureInput!) {
		updateUserPicture(input: $input) {
			id
			picture
		}
	}
`;

export const DELETE_ACCOUNT = gql`
	mutation DeleteUser {
		closeAccount
	}
`;

export const EXPORT_DATA = gql`
	mutation ExportRGPD {
		exportUserData {
			id
		}
	}
`;
