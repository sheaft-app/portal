import gql from "graphql-tag";

export const UPDATE_CONSUMER = gql`
	mutation UpdateConsumer($input: UpdateConsumerInput) {
		updateConsumerUser(input: $input) {
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

export const UPDATE_STORE = gql`
	mutation UpdateStore($input: UpdateStoreInput) {
		updateStore(input: $input) {
			id
			lastName
			firstName
			name
			siret
			vatIdentifier
			openForNewBusiness
			description
			email
			phone
			address{
				line1
				line2
				zipcode
				city
				country
				latitude
				longitude
			}
			tags{
				id 
				name
				kind
			}
			openingHours {
				day
				from
				to
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
			siret
			vatIdentifier
			openForNewBusiness
			description
			email
			phone
			address{
				line1
				line2
				zipcode
				city
				country
				latitude
				longitude
			}
			tags{
				id 
				name
				kind
			}
		}
	}
`;

export const UPDATE_USER_PICTURE = gql`
	mutation UpdateUserPicture($input: UpdatePictureInput!) {
		updateUserPicture(input: $input) {
			id
			picture
		}
	}
`;

export const DELETE_ACCOUNT = gql`
	mutation DeleteUser($input: DeleteUserInput!) {
		deleteUser(input: $input)
	}
`;

export const EXPORT_DATA = gql`
	mutation ExportRGPD($input: IdInput) {
		exportRGPD(input: $input) {
			id
		}
	}
`;
