import Oidc from "oidc-client";
import { config } from "./../configs/config.js";
import {
	authAuthenticated,
	authAuthorized,
	authInitialized,
	authRegistered,
	authUserAccount,
} from "./../stores/auth.js";
import { clearLocalStorage } from "./../helpers/storage";

class SheaftAuth {
	constructor(oidcSettings) {
		this.user = { profile: { role: "ANONYMOUS" } };
		this.registered = false;
		this.initialized = false;
		this.authorized = false;
		this.authenticated = false;

		this.userManager = new Oidc.UserManager(oidcSettings);
		this.userManager.clearStaleState();

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

		this.userManager.getUser().then(
			async (user) => {
				if (user) {
					await this.retrieveUser(user, true);
					return;
				}

				this.setAuthStatus({ profile: { role: ["ANONYMOUS"] } }, false, false, false, true);
			},
			(reason) => {
				localStorage.removeItem("user");
				this.setAuthStatus({ profile: { role: ["ANONYMOUS"] } }, false, false, false, true);
			}
		);

		this.userManager.events.addUserLoaded(async (user) => {
			await this.retrieveUser(user, false);
		});

		this.userManager.events.addUserUnloaded((e) => {});

		this.userManager.events.addAccessTokenExpiring(async () => {
			await this.loginSilent();
		});

		this.userManager.events.addAccessTokenExpired(async () => {
			await this.login();
		});
	}

	async retrieveUser(user, onInit) {
		let localUser = JSON.parse(localStorage.getItem("user"));
		if (localUser && localUser.id && localUser.id.length > 0) {
			user.id = localUser.id;
			user.profile.id = localUser.profileId;
		}

		try {
			let result = await fetch(config.api + "/graphql", getUserInfoSettings(user));
			if (result.status === 401) {
				await this.userManager.removeUser();
				await this.login();
				return;
			}

			let content = await result.json();
			if (content.data.me && content.data.me.id) {
				user.id = content.data.me.id;
				user.profile.id = content.data.me.profileId;
				this.setAuthStatus(user, true, true, true, true);
				return;
			} else {
				this.setAuthStatus(user, true, true, false, true);
				return;
			}
		} catch (err) {
			console.error(err ? err.toString() : "An authorization exception occurred.");
			this.setAuthStatus(user, true, true, !user.profile.role.includes("ANONYMOUS"), true);
			return;
		}		
	}

	setAuthStatus(user, authenticated, authorized, registered, initialized) {
		if (this.user != user) authUserAccount.set(user);
		if (this.authorized != authorized) authAuthorized.set(authorized);
		if (this.registered != registered) authRegistered.set(registered);
		if (this.authenticated != authenticated) authAuthenticated.set(authenticated);
		if (this.initialized != initialized) authInitialized.set(initialized);

		localStorage.setItem(
			"user",
			JSON.stringify({
				id: user.id,
				profileId: user.profile.id,
				authenticated: authenticated,
				authorized: authorized,
				registered: registered,
				role: user.profile.role,
			})
		);
	}

	userIsAnonymous() {
		return this.initialized && !this.authenticated;
	}

	async userIsLoggedIn() {
		let result = !this.userIsAnonymous() && this.initialized && this.authenticated;
		if (!result) return await this.login(window.location.hash);

		return result;
	}

	userIsRegistered() {
		return this.userIsLoggedIn() && this.initialized && this.registered;
	}

	userHasAccess(roles) {
		return this.userIsLoggedIn() && this.isInRole(roles);
	}

	isInRole(roles) {
		if (!roles) return false;

		let rolesToTest = [];
		if (!Array.isArray(roles)) rolesToTest = [roles];
		else rolesToTest = roles;

		return userIsInRole(this.user, rolesToTest);
	}

	async login(redirectUrl) {
		try {
			if (redirectUrl && redirectUrl.length > 0) {
				if (redirectUrl.indexOf("/") === 0) redirectUrl = `#${redirectUrl}`;

				if (redirectUrl[0] !== "#") redirectUrl = `#/${redirectUrl}`;
			} else redirectUrl = "#/";

			return await this.userManager.signinRedirect({
				state: { redirectTo: redirectUrl },
			});
		} catch (ex) {
			await this.userManager.clearStaleState();
			console.log(ex);
		}
	}

	async loginCallback() {
		try {
			return await this.userManager.signinCallback();
		} catch (ex) {
			await this.userManager.clearStaleState();
			console.log(ex);
		}
	}

	async loginSilentCallback() {
		try {
			return await this.userManager.signinSilentCallback();
		} catch (ex) {
			await this.userManager.clearStaleState();
			console.log(ex);
		}
	}

	async logout() {
		try {
			clearLocalStorage();
			await this.userManager.signoutRedirect();
		} catch (exc) {
			await this.userManager.clearStaleState();
			await this.userManager.removeUser();
			location.hash = "";
			location.reload();
		}
	}

	async loginSilent() {
		try {
			return await this.userManager.signinSilent();
		} catch (ex) {
			await this.userManager.clearStaleState();
			console.log(ex);
		}
	}

	async refreshLogin(url) {
		try {
			await this.userManager.removeUser();
			return await this.login(url ? url : window.location.hash);
		} catch (ex) {
			await this.userManager.clearStaleState();
			console.log(ex);
		}
	}

	unregister() {
		if (this.authorizedSub) this.authorizedSub();
		if (this.authenticatedSub) this.authenticatedSub();
		if (this.registeredSub) this.registeredSub();
		if (this.initializedSub) this.initializedSub();
		if (this.userSub) this.userSub();

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
		body: '{"operationName":"GetMeDetails","variables":{},"query":"query GetMeDetails {me {id profileId}}"}',
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
