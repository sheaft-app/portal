import Oidc from "oidc-client";
import { config } from "./../configs/config.js";
import {
	authAuthenticated,
	authUserAccount,
	authInitialized,
	authRegistered,
	authAuthorized,
} from "./../stores/auth.js";
import { clearLocalStorage } from "./../helpers/storage";

class SheaftAuth {
	constructor(oidcSettings) {
		this.userManager = new Oidc.UserManager(oidcSettings);
		this.userManager.clearStaleState();
		this.setAuthStatus({ profile: { role: "ANONYMOUS" } }, false, false, false, false);

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
				await this.retrieveUser(user);
				return;
			}

			this.setAuthStatus({ profile: { role: "ANONYMOUS" } }, false, false, false, true);
		});

		this.userManager.events.addUserLoaded(async (user) => {
			await this.retrieveUser(user);
		});

		this.userManager.events.addUserUnloaded((e) => {});

		this.userManager.events.addAccessTokenExpiring(async () => {
			await this.loginSilent();
		});

		this.userManager.events.addAccessTokenExpired(async () => {
			await this.login();
		});
	}

	async retrieveUser(user) {
		try {
			var result = await fetch(
				config.api + "/graphql",
				getUserInfoSettings(user)
			);

			var content = await result.json();
			if (content.data.me && content.data.me.id) {
				this.setAuthStatus(user, true, true, true, true);
			} else if (content.errors && content.errors.length > 0) {
				throw content.errors;
			} else {
				this.setAuthStatus(user, true, true, false, true);
			}
		} catch (err) {
			console.error(err ? err.toString() : "An authorization exception occured.");
			this.userManager.removeUser();
			this.setAuthStatus({ profile: { role: "ANONYMOUS" } }, false, false, false, true);
			
			if(location.hash != '/'){
				location.hash = "/";
				location.reload();
			}
		}
	}

	setAuthStatus(user, authenticated, authorized, registered, initialized) {
		authUserAccount.set(user);
		authAuthenticated.set(authenticated);
		authAuthorized.set(authorized);
		authRegistered.set(registered);
		authInitialized.set(initialized);
	}

	userIsAnonymous() {
		return this.initialized && !this.authenticated;
	}

	userIsLoggedIn() {
		var result =
			!this.userIsAnonymous() && this.initialized && this.authenticated;
		if (!result) this.login(window.location.hash);

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

	async login(redirectUrl) {
		try {
			if (redirectUrl && redirectUrl.length > 0) {
				if (redirectUrl.indexOf("/") == 0) {
					redirectUrl = `#${redirectUrl}`;
				}

				if (redirectUrl[0] != "#") {
					redirectUrl = `#/${redirectUrl}`;
				}

				return await this.userManager.signinRedirect({
					state: { redirectTo: redirectUrl },
				});
			}

			return await this.userManager.signinRedirect();
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
			clearLocalStorage();
			await this.userManager.signoutRedirect();
			await this.userManager.removeUser();
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
