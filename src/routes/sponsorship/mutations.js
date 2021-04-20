import gql from "graphql-tag";

export const GENERATE_USER_SPONSORING_CODE = gql`
	mutation GenerateUserSponsoringCode($input: GenerateUserCodeInput!) {
		generateUserSponsoringCode(input: $input)
	}
`;