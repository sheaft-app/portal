export const config = {
	env: "remote",
	front: "http://localhost:4200",
	api: "https://sheaft-api-rd.azurewebsites.net",
	signalr: "https://sheaft-signalr-rd.azurewebsites.net",
	content: "https://rd.content.sheaft.com",
	auth: {
		url: "https://sheaft-identity-rd.azurewebsites.net",
		settings: {
			client_id: "37f6e39f-5b99-4943-b906-a033bdf2f1bb",
			redirect_uri: "http://localhost:4200/#/callback",
			post_logout_redirect_uri: "http://localhost:4200",
			response_type: "code",
			scope: "openid profile email crud role offline_access",
			authority: "https://sheaft-identity-rd.azurewebsites.net",
			silent_redirect_uri: "http://localhost:4200/#/callback-silent",
			automaticSilentRenew: true,
			loadUserInfo: true,
			filterProtocolClaims: true,
			response_mode: "query",
		},
	},
	production: false
};
