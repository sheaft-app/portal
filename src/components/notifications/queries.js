import gql from "graphql-tag";

export const GET_NOTIFICATIONS = gql`
	query GetNotifications($first: Int, $after: String) {
		notifications(first: $first, after: $after, order: { createdOn: DESC }) {
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

export const GET_UNREAD_NOTIFICATIONS_COUNT = gql`
	query GetUnreadNotificationsCount {
		unreadNotificationsCount
	}
`;
