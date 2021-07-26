<script>
	import { InitGraphQL } from "./services/SheaftGraphQL.js";
	import { InitAuth } from "./services/SheaftAuth.js";
	import { InitSignalr } from "./services/SheaftSignalr.js";
	import { InitRouter } from "./services/SheaftRouter.js";
	import { InitGuard } from "./services/SheaftGuard.js";
	import { InitNotifications } from "./services/SheaftNotifications.js";
	import SheaftErrors from "./services/SheaftErrors.js";
	import Oidc from "oidc-client";
	import GraphQLContext from "./components/GraphQLContext.svelte";
	import Main from "./Main.svelte";
	import { config } from "./configs/config.js";

	let authSettings = config.auth.settings;
	authSettings.userStore = new Oidc.WebStorageStateStore({ store: window.localStorage });
  
	const authInstance = InitAuth(authSettings);
	const notificationsInstance = InitNotifications({
		duration: 6000,
		ripple: true, 
		dismissible: true,
		position: { x: "right", y: "top" },
	});

	const errorsHandlers = new SheaftErrors(notificationsInstance);
	const apiInstance = InitGraphQL(authInstance, config.api, errorsHandlers);
	const routerInstance = InitRouter();
	const guardInstance = InitGuard(authInstance, routerInstance);
	const signalrInstance = InitSignalr(config.signalr + "/hubs/sheaft", authInstance, notificationsInstance);
</script>

<GraphQLContext>
	<Main {authInstance} {errorsHandlers} {guardInstance} {routerInstance} {signalrInstance} {notificationsInstance} />
</GraphQLContext>
