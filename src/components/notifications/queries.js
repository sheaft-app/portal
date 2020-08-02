import gql from "graphql-tag";

export const GET_NOTIFICATIONS = gql`
	query GetNotifications($first: PaginationAmount, $after: String) {
		notifications(first: $first, after: $after, order_by: { createdOn: DESC }) {
			edges {
				node {
					id
					kind
					method
					createdOn
					content
					unread
				}
			}
			pageInfo {
				endCursor
				hasNextPage
			}
		}
	}
`;
