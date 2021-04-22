import gql from "graphql-tag";

export const GET_AGREEMENTS = gql`
	query GetAgreements(
		$first: PaginationAmount
		$after: String
		$last: PaginationAmount
		$before: String
		$orderBy: AgreementSort
		$where: AgreementFilter
	) {
		agreements (
			first: $first,
			after: $after,
			last: $last,
			before: $before,
			order_by: $orderBy
			where: $where) {
				pageInfo {
					startCursor
					endCursor
					hasNextPage
					hasPreviousPage
				}
				totalCount
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
						delivery {
							producer {
								id
								name
							}
						}
						selectedHours{
							day
							from
							to
						}
						catalog{
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
					line1
					line2
					city
					zipcode
				}
				phone
				email
			}
			delivery {
				producer {
					id
					name
					address {
						line1
						line2
						city
						zipcode
					}
					phone
					email
				}
			}
			selectedHours{
				day
				from
				to
			}
			catalog{
				name
			}
		}
	}
`;
