import Oidc from "oidc-client";
import { config } from "./../configs/config.js";
import {
	authAuthenticated,
	authUserAccount,
	authInitialized,
	authRegistered,
	authAuthorized,
} from "./../stores/auth.js";

class SheaftAuth {
	constructor(oidcSettings) {
		this.userManager = new Oidc.UserManager(oidcSettings);

		authAuthenticated.set(false);
		authInitialized.set(false);
		authRegistered.set(false);
		authAuthorized.set(false);
		authUserAccount.set({ profile: { role: "ANONYMOUS" } });

		this.userSub = authUserAccount.subscribe((value) => {
			this.user = value;
		});
		this.initializedSub = authInitialized.subscribe((value) => {
			this.initialized = value;
		});
		this.authenticatedSub = authAuthenticated.subscribe((value) => {
			this.authenticated = value;
		});
		this.registeredSub = authRegistered.subscribe((value) => {
			this.registered = value;
		});
		this.authorizedSub = authAuthorized.subscribe((value) => {
			this.authorized = value;
		});

		this.userManager.getUser().then(async (user) => {
			if (user) {
				authUserAccount.set(user);
				authAuthenticated.set(true);

				try {					
					var result = await fetch(
						config.api + "/graphql",
						getUserInfoSettings(user)
					);
					
					var content = await result.json();
					if (content.data.me && content.data.me.id) {
						authRegistered.set(true);
						localStorage.removeItem("user_choosen_role");
						localStorage.removeItem("sponsoring");
					} else if (content.errors && content.errors.length > 0) {
						authInstance.logoutFromApp();
						return;
					} else { 
						authRegistered.set(false);
					}

					authAuthorized.set(true);
					authInitialized.set(true);

				} catch (err) {
					console.error(err.toString());
					authAuthorized.set(false);
					authInitialized.set(false);
				}
			} else {
				authRegistered.set(false);
				authAuthenticated.set(false);
				authAuthorized.set(false);
				authInitialized.set(true);
			}
		});

		this.userManager.events.addUserLoaded(async (user) => {
			authUserAccount.set(user);
			authAuthenticated.set(true);

			try {
				var result = await fetch(
					config.api + "/graphql",
					getUserInfoSettings(user)
				);

				var content = await result.json();
				if (content.data.me && content.data.me.id) {
					authRegistered.set(true);
					localStorage.removeItem("user_choosen_role");
					localStorage.removeItem("sponsoring");
				} else if (content.errors && content.errors.length > 0) {
					authInstance.logoutFromApp();
					return;
				} else {
					authRegistered.set(false);
				}

				authAuthorized.set(true);
			} catch (err) {
				console.error(err.toString());
				authAuthorized.set(false);
			}
		});

		this.userManager.events.addUserUnloaded((e) => {});

		this.userManager.events.addAccessTokenExpiring(async () => {
			await this.loginSilent();
		});

		this.userManager.events.addAccessTokenExpired(async () => {
			await this.login();
		});
	}

	userIsAnonymous() {
		return this.initialized && !this.authenticated;
	}

	userIsLoggedIn() {
		var result = !this.userIsAnonymous() && this.initialized && this.authenticated;
		if (!result) this.login();

		return result;
	}

	userIsRegistered() {
		return this.userIsLoggedIn() && this.initialized && this.registered;
	}

	userHasAccess(roles) {
		return this.userIsLoggedIn() && this.isInRole(roles);
	}

	isInRole(roles) {
		if (!roles || !this.authenticated) return false;

		var rolesToTest = [];
		if (!Array.isArray(roles)) rolesToTest = [roles];
		else rolesToTest = roles;

		return userIsInRole(this.user, rolesToTest);
	}

	async login() {
		try {
			return await this.userManager.signinRedirect({
				state: { redirectTo: window.location.hash },
			});
		} catch (exc) {
			location.hash = "";
			location.reload();
		}
	}

	async loginCallback() {
		try {
			return await this.userManager.signinCallback();
		} catch (exc) {
			location.hash = "";
			location.reload();
		}
	}

	async loginSilentCallback() {
		try {
			return await this.userManager.signinSilentCallback();
		} catch (exc) {
			location.hash = "";
			location.reload();
		}
	}

	async logout() {
		try {
			localStorage.removeItem("user_cart");
			localStorage.removeItem("user_choosen_role");
			localStorage.removeItem("sponsoring");
			localStorage.removeItem("user_cookie_consent");

			return await this.userManager.signoutRedirect();
		} catch (exc) {
			location.hash = "";
			location.reload();
		}
	}

	async logoutFromApp() {
		try {
			await this.userManager.removeUser();
			location.hash = "";
			location.reload();
		} catch (exc) {
			location.hash = "";
			location.reload();
		}
	}

	async loginSilent() {
		try {
			await this.userManager.removeUser();
			var user = await this.userManager.signinSilent();
			return user;
		} catch (ex) {
			location.hash = "";
			location.reload();
		}
	}

	unregister() {
		this.authorizedSub.unsubscribe();
		this.authenticatedSub.unsubscribe();
		this.registeredSub.unsubscribe();
		this.initializedSub.unsubscribe();
		this.userSub.unsubscribe();

		this.userManager.events.removeAccessTokenExpiring();
		this.userManager.events.removeAccessTokenExpired();
		this.userManager.events.removeSilentRenewError();
		this.userManager.events.removeUserLoaded();
		this.userManager.events.removeUserUnloaded();
	}
}

function getUserInfoSettings(user) {
	return {
		method: "POST",
		body:
			'{"operationName":"GetMeDetails","variables":{},"query":"query GetMeDetails {me {id}}"}',
		headers: {
			"Content-Type": "application/json",
			Authorization: "Bearer " + user.access_token,
		},
	};
}

function userIsInRole(user, roles) {
	if (!roles || roles.length == 0) return false;

	if (!user.profile.role) {
		return false;
	}

	var userRoles = [];
	if (!Array.isArray(user.profile.role)) userRoles = [user.profile.role];
	else userRoles = user.profile.role;

	let roleFound = false;
	for (var i = 0; i < roles.length; i++) {
		if (userRoles.indexOf(roles[i]) > -1) {
			roleFound = true;
			break;
		}
	}

	return roleFound;
}

let authInstance = null;

export function InitAuth(oidcSettings) {
	authInstance = new SheaftAuth(oidcSettings);
	return authInstance;
}

export default function GetAuthInstance() {
	return authInstance;
}
