export const config = {
	env: "production",
	front: "https://rd.app.sheaft.com",
	api: "https://sheaft-api-rd.azurewebsites.net",
	signalr: "https://sheaft-signalr-rd.azurewebsites.net",
	auth: {
		url: "https://sheaft-identity-rd.azurewebsites.net",
		settings: {
			client_id: "37f6e39f-5b99-4943-b906-a033bdf2f1bb",
			redirect_uri: "https://rd.app.sheaft.com/#/callback",
			post_logout_redirect_uri: "https://rd.app.sheaft.com",
			response_type: "code",
			scope: "openid profile email crud role offline_access",
			authority: "https://sheaft-identity-rd.azurewebsites.net",
			silent_redirect_uri: "https://rd.app.sheaft.com/#/callback-silent",
			automaticSilentRenew: true,
			loadUserInfo: true,
			filterProtocolClaims: true,
			response_mode: "query",
		},
	},
	production: true
};
