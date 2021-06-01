import gql from "graphql-tag";

export const GET_JOBS = gql`
	query GetJobs($first: Int, $after: String, $last: Int, $before: String, $orderBy: [JobSortInput!]) {
		jobs(first: $first, after: $after, last: $last, before: $before, order: $orderBy) {
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
		job(id: $id) {
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
