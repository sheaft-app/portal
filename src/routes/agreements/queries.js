import gql from "graphql-tag";

export const GET_AGREEMENTS = gql`
	query GetAgreements(
		$first: Int
		$after: String
		$last: Int
		$before: String
		$orderBy: [AgreementSort!]
		$where: AgreementFilter
	) {
		agreements (
			first: $first,
			after: $after,
			last: $last,
			before: $before,
			order: $orderBy
			where: $where) {
				pageInfo {
					startCursor
					endCursor
					hasNextPage
					hasPreviousPage
				}
				edges {
					cursor
					node {
						id
						status
						createdOn
						store {
							id
							name
						}
						producer {
							id
							name
						}
						catalog{
							id
							name
						}
					}
				}
			}
	}
`;

export const GET_AGREEMENT_DETAILS = gql`
	query GetAgreement($id: ID!) {
		agreement(input: $id) {
			id
			status
			createdOn
			store {
				id
				name
				address {
					latitude
					longitude
				}
				phone
				email
			}
			delivery {
				id
				name
				deliveryHours{
				from
				to
				day
				}
			}
			producer {
				id
				name
				address {
					latitude
					longitude
				}
				phone
				email
			}
			catalog{
				id
				name
			}
		}
	}
`;
