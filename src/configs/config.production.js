export const config = {
	env: "production",
	front: "https://app.sheaft.com",
	api: "https://api.sheaft.com",
	signalr: "https://signalr.sheaft.com",
	auth: {
		url: "https://auth.sheaft.com",
		settings: {
			client_id: "990966C64E554C6298970F5D6FBEEDEA",
			redirect_uri: "https://app.sheaft.com/#/callback",
			post_logout_redirect_uri: "https://app.sheaft.com",
			response_type: "code",
			scope: "openid profile email role offline_access",
			authority: "https://auth.sheaft.com",
			silent_redirect_uri: "https://app.sheaft.com/#/callback-silent",
			automaticSilentRenew: true,
			loadUserInfo: true,
			filterProtocolClaims: true,
			response_mode: "query",
		},
	},
	analytics: {
		settings: {
			config: {
				instrumentationKey: "e271341d-a39b-4b08-b9c1-68328fb5ddab",
				enableDebug: false,
				enableAutoRouteTracking: true,
				disableFetchTracking: false,
				disableAjaxTracking: false,
				isCookieUseDisabled: true,
				cookieDomain: "sheaft.com",
			},
		},
	},
	production: true
};
