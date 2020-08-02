export const config = {
	env: "remote",
	front: "http://localhost:4200",
	api: "https://api.sheaft.com",
	signalr: "https://signalr.sheaft.com",
	auth: {
		url: "https://auth.sheaft.com",
		settings: {
			client_id: "990966C64E554C6298970F5D6FBEEDEA",
			redirect_uri: "http://localhost:4200/#/callback",
			post_logout_redirect_uri: "http://localhost:4200",
			response_type: "code",
			scope: "openid profile email api.all offline_access",
			authority: "https://auth.sheaft.com",
			silent_redirect_uri: "http://localhost:4200/#/callback-silent",
			automaticSilentRenew: true,
			loadUserInfo: true,
			response_mode: "query",
		},
	},
	analytics: {
		settings: {
			config: {
				instrumentationKey: "e271341d-a39b-4b08-b9c1-68328fb5ddab",
				enableDebug: true,
				enableAutoRouteTracking: true,
				disableFetchTracking: false,
				disableAjaxTracking: false,
				isCookieUseDisabled: true,
				cookieDomain: "localhost:4200",
			},
		},
	},
	production: false
};
