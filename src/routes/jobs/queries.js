import gql from "graphql-tag";

export const GET_JOBS = gql`
	query GetJobs(
		$first: PaginationAmount
		$after: String
		$last: PaginationAmount
		$before: String
		$orderBy:JobSort
	) {
		jobs(first: $first, after: $after, last: $last, before: $before, order_by: $orderBy) {
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
					name
					createdOn
					updatedOn
					status
					kind
					startedOn
					completedOn
					file
					user {
						name
					}
				}
			}
		}
	}
`;

export const GET_JOB_DETAILS = gql`
	query GetJobDetails($id: ID!) {
		job(input: $id) {
			id
			name
			createdOn
			updatedOn
			status
			startedOn
			completedOn
			retried
			message
			kind
			file
			user {
				name
			}
		}
	}
`;
