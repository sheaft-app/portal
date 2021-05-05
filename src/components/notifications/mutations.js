import gql from "graphql-tag";

export const MARK_USER_NOTIFICATIONS_AS_READ = gql`
	mutation MarkUserNotificationsAsRead{
		markNotificationsAsRead
	}
`;

export const MARK_USER_NOTIFICATION_AS_READ = gql`
	mutation MarkUserNotificationAsRead($input: MarkUserNotificationAsReadInput!){
		markNotificationAsRead(input: $input)
		{
			id
		}
	}
`;