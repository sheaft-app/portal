import Oidc from "oidc-client";
import { config } from "./../configs/config.js";
import {
	authAuthenticated,
	authUserAccount,
	authInitialized,
	authRegistered,
} from "./../stores/auth.js";

class SheaftAuth {
	constructor(oidcSettings) {
		this.userManager = new Oidc.UserManager(oidcSettings);

		authAuthenticated.set(false);
		authInitialized.set(false);
		authRegistered.set(false);
		authUserAccount.set({ profile: { role: "ANONYMOUS" } });

		this.userSub = authUserAccount.subscribe((value) => {
			this.user = value;
		});
		this.initSub = authInitialized.subscribe((value) => {
			this.initialized = value;
		});
		this.authSub = authAuthenticated.subscribe((value) => {
			this.authenticated = value;
		});
		this.regSub = authRegistered.subscribe((value) => {
			this.registered = value;
		});

		this.userManager.getUser().then((user) => {
			if (user) {
				authUserAccount.set(user);
				authAuthenticated.set(true);
				authRegistered.set(
					userIsInRole(user, ["CONSUMER", "PRODUCER", "STORE"])
				);

				var postSettings = {
					method: "POST",
					body:
						'{"operationName":"GetMeDetails","variables":{},"query":"query GetMeDetails {me {id}}"}',
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer " + user.access_token,
					},
				};

				try {
					fetch(config.api + "/graphql", postSettings).then((res) => {
						res.json().then((content) => {
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
							authInitialized.set(true);
						});
					});
				} catch (err) {
					authRegistered.set(false);
					authInitialized.set(true);
				}
			} else {
				authRegistered.set(false);
				authAuthenticated.set(false);
				authInitialized.set(true);
			}
		});

		this.userManager.events.addUserLoaded(function (user) {
			authUserAccount.set(user);
			authAuthenticated.set(true);
			authRegistered.set(userIsInRole(user, ["CONSUMER", "PRODUCER", "STORE"]));

			var postSettings = {
				method: "POST",
				body:
					'{"operationName":"GetMeDetails","variables":{},"query":"query GetMeDetails {me {id}}"}',
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + user.access_token,
				},
			};

			try {
				fetch(config.api + "/graphql", postSettings).then((res) => {
					res.json().then((content) => {
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

						authInitialized.set(true);
					});
				});
			} catch (err) {
				authRegistered.set(false);
				authInitialized.set(true);
			}
		});

		this.userManager.events.addUserUnloaded(function (e) {});

		this.userManager.events.addAccessTokenExpiring(async () => {
			await this.loginSilent();
		});

		this.userManager.events.addAccessTokenExpired(async () => {
			await this.login();
		});
	}

	authorize(roles) {
		return this.isInRole(roles);
	}

	isInRole(roles) {
		if(!roles || !this.authenticated)
			return false;

		var rolesToTest = [];
		if (!Array.isArray(roles)) 
			rolesToTest = [roles];
		else 
			rolesToTest = roles;

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
		this.authSub.unsubscribe();
		this.regSub.unsubscribe();
		this.initSub.unsubscribe();
		this.userSub.unsubscribe();
		this.userManager.events.removeAccessTokenExpiring();
		this.userManager.events.removeAccessTokenExpired();
		this.userManager.events.removeSilentRenewError();
		this.userManager.events.removeUserLoaded();
		this.userManager.events.removeUserUnloaded();
	}
}

function userIsInRole(user, roles) {
	if (!roles || roles.length == 0) 
		return false;

	if (!user.profile.role)
	{
		return false;
	}

	var userRoles = [];
	if(!Array.isArray(user.profile.role))
		userRoles = [user.profile.role];
	else
		userRoles = user.profile.role;

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
