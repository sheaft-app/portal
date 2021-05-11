import gql from "graphql-tag";

export const GET_AGREEMENTS = gql`
	query GetAgreements(
		$first: Int
		$after: String
		$last: Int
		$before: String
		$orderBy: [AgreementSortInput!]
		$where: AgreementFilterInput
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
						delivery {
							name
							deliveryHours{
							from
							to
							day
							}
						}
					}
				}
			}
	}
`;

export const GET_AGREEMENT_DETAILS = gql`
	query GetAgreement($id: ID!) {
		agreement(id: $id) {
			id
			status
			createdOn
			store {
				id
				name
				summary
				address {
					line1
					line2
					zipcode
					city
					latitude
					longitude
				}
				phone
				email
				closings{
					from
					to
				}
				tags{
					name
					kind
				}
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
				summary
				address {
					line1
					line2
					zipcode
					city
					latitude
					longitude
				}
				phone
				email
				closings{
					from
					to
				}
				tags{
					name
					kind
				}
			}
			catalog{
				id
				name
				products {
					name
					reference
					wholeSalePricePerUnit
				}
			}
		}
	}
`;
