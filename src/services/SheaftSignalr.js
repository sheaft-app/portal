import { HubConnectionBuilder, HttpTransportType, LogLevel, HubConnectionState } from "@microsoft/signalr";
import { config } from "../configs/config.js";
import { getFormattedNotification } from "./../components/notifications/helpers.js";

class SheaftSignalr {
	constructor(url, authManager, notifManager, graphQL) {
		this.url = url;
		this.authManager = authManager;
		this.notifManager = notifManager;
		this.graphQL = graphQL;

		this.connection = new HubConnectionBuilder()
			.withUrl(url, {
				transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
				accessTokenFactory: () => {
					return this.authManager.user.access_token;
				},
			})
			.configureLogging(config.production ? LogLevel.None : LogLevel.Debug)
			.withAutomaticReconnect()
			.build();

		this.connection.on("event", (message) => {
			var notif = { method: message.method, content: message.content };
			var notification = getFormattedNotification(this.graphQL, notif, false, message.display ? message.display : true);

			this.notifManager.sendNotification(notification);
		});
	}

	start() {
		if (this.connection.state == HubConnectionState.Disconnected)
			this.connection.start().catch((err) => console.error(err));
	}

	stop() {
		if (this.connection.state == HubConnectionState.Connected)
			this.connection.stop().catch((err) => console.error(err));
	}
}

export function InitSignalr(url, authManager, notifManager) {
	signalrInstance = new SheaftSignalr(url, authManager, notifManager);
	Object.freeze(signalrInstance);
	return signalrInstance;
}

let signalrInstance = null;
export default function GetSignalrInstance() {
	return signalrInstance;
}
