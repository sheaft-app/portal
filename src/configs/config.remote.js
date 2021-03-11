export const config = {
	env: "remote",	
	front: "http://localhost:4200",
	api: "https://staging.api.sheaft.com",
	signalr: "https://staging.signalr.sheaft.com",
	content: "https://staging.content.sheaft.com",
	auth: {
		url: "https://staging.auth.sheaft.com",
		settings: {
			client_id: "37f6e39f-5b99-4943-b906-a033bdf2f1bb",
			redirect_uri: "http://localhost:4200/#/callback",
			post_logout_redirect_uri: "http://localhost:4200",
			response_type: "code",
			scope: "openid profile email crud role offline_access",
			authority: "https://staging.auth.sheaft.com",
			silent_redirect_uri: "http://localhost:4200/#/callback-silent",
			automaticSilentRenew: true,
			loadUserInfo: true,
			filterProtocolClaims: true,
			response_mode: "query",
		},
	},
	production: false
};
