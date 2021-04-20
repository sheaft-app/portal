import gql from "graphql-tag";

export const MARK_USER_NOTIFICATIONS_AS_READ = gql`
	mutation MarkUserNotificationsAsRead{
		markUserNotificationsAsRead
	}
`;

export const MARK_USER_NOTIFICATION_AS_READ = gql`
	mutation MarkUserNotificationAsRead($input: MarkUserNotificationAsReadInput!){
		markUserNotificationAsRead(input: $input)
		{
			id
		}
	}
`;