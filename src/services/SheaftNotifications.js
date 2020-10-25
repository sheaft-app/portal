import { Notyf } from "notyf";
import { notifications } from "./../components/notifications/store.js";
import { getFormattedNotification } from "./../components/notifications/helpers.js";

let allNotifications = [];

class SheaftNotificationManager {
	constructor(notifSettings) {
		this.notificationSubscribe = notifications.subscribe((items) => {
			allNotifications = items;
		})

		this.notify = new Notyf({
			...notifSettings,
			types: [
				{
					type:"success",
					background: "#ffffff",
					className: "text-normal",
					icon: {
						className: "material-icons success-color",
						tagName: "i",
						text: "check_circle_outline",
					},
				},
				{
					type:"error",
					background: "#ffffff",
					className: "text-normal",
					icon: {
						className: "material-icons error-color",
						tagName: "i",
						text: "error",
					},
				},
				{
					type:"info",
					background: "#ffffff",
					className: "text-normal",
					icon: {
						className: "material-icons info-color",
						tagName: "i",
						text: "info",
					},
				},
				{
					type:"help",
					background: "#ffffff",
					className: "text-normal",
					icon: {
						className: "material-icons help-color",
						tagName: "i",
						text: "help",
					},
				},
				{
					type:"warning",
					background: "#ffffff",
					className: "text-normal",
					icon: {
						className: "material-icons warning-color",
						tagName: "i",
						text: "warning",
					},
				},
				{
					type:"hold",
					background: "#ffffff",
					className: "text-normal",
					icon: {
						className: "material-icons hold-color",
						tagName: "i",
						text: "pause",
					},
				},
				{
					type:"progress",
					background: "#ffffff",
					className: "text-normal",
					icon: {
						className: "material-icons progress-color",
						tagName: "i",
						text: "redo",
					},
				},
				{
					type:"primary",
					background: "#009688",
					className: "text-white",
					icon: false,
				},
				{
					type:"accent",
					className: "text-white",
					background: "#ff4081",
					icon: {
						className: "material-icons accent-color",
						tagName: "i",
						text: "exclamation",
					},
				},
			],
		});
	}

	success(message, url, addToStore, show) {
		this.formatAndSendNotification(message, "success", url, addToStore, show);
	}

	error(message, url, addToStore, show) {
		this.formatAndSendNotification(message, "error", url, addToStore, show);
	}

	primary(message, url, addToStore, show) {
		this.formatAndSendNotification(message, "primary", url, addToStore, show);
	}

	accent(message, url, addToStore, show) {
		this.formatAndSendNotification(message, "accent", url, addToStore, show);
	}

	info(message, url, addToStore, show) {
		this.formatAndSendNotification(message, "info", url, addToStore, show);
	}

	help(message, url, addToStore, show) {
		this.formatAndSendNotification(message, "help", url, addToStore, show);
	}

	hold(message, url, addToStore, show) {
		this.formatAndSendNotification(message, "hold", url, addToStore, show);
	}

	progress(message, url, addToStore, show) {
		this.formatAndSendNotification(message, "progress", url, addToStore, show);
	}

	warning(message, url, addToStore, show) {
		this.formatAndSendNotification(message, "warning", url, addToStore, show);
	}

	formatAndSendNotification(message, type, url, addToStore, show){		
		var notif = getFormattedNotification(null, {message, type, url, addToStore, show}, true);
		this.sendNotification(notif);
	}

	sendNotification(notification) {
		if (notification.addToStore) {
			allNotifications.push(notification);
			notifications.set(allNotifications);
			notificationsCount.set(allNotifications.filter((e) => e.unread).length);
		}

		if (notification.show)
			this.notify.open({
				type: notification.type,
				message: notification.url ? `<p class="mb-2">${notification.message}</p><a href="${notification.url}">Voir les détails</a>` : notification.message,
			});
	}

	dismissAll() {
		return this.notify.dismissAll();
	}

	unregister(){
		this.notificationSubscribe.unsubscribe();
	}
}

let notificationsInstance = null;

export function InitNotifications(notifSettings) {
	notificationsInstance = new SheaftNotificationManager(notifSettings);
	Object.freeze(notificationsInstance);
	return notificationsInstance;
}

export default function GetNotificationsInstance() {
	return notificationsInstance;
}