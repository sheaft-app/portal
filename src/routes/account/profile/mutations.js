import gql from "graphql-tag";

export const UPDATE_ME = gql`
	mutation UpdateUser($input: UpdateUserInput) {
		updateUser(input: $input) {
			id
			lastName
			firstName
			email
			phone
		}
	}
`;

export const UPDATE_USER_PICTURE = gql`
	mutation UpdateUserPicture($input: UpdatePictureInput!) {
		updateUserPicture(input: $input) {
			id
			lastName
			firstName
			picture
			email
			phone
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
