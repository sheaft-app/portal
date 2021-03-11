export const config = {
	env: "production",
	front: "https://staging.app.sheaft.com",
	api: "https://staging.api.sheaft.com",
	signalr: "https://staging.signalr.sheaft.com",
	content: "https://staging.content.sheaft.com",
	auth: {
		url: "https://staging.auth.sheaft.com",
		settings: {
			client_id: "37f6e39f-5b99-4943-b906-a033bdf2f1bb",
			redirect_uri: "https://staging.app.sheaft.com/#/callback",
			post_logout_redirect_uri: "https://staging.app.sheaft.com",
			response_type: "code",
			scope: "openid profile email crud role offline_access",
			authority: "https://staging.auth.sheaft.com",
			silent_redirect_uri: "https://staging.app.sheaft.com/#/callback-silent",
			automaticSilentRenew: true,
			loadUserInfo: true,
			filterProtocolClaims: true,
			response_mode: "query",
		},
	},
	production: true
};
