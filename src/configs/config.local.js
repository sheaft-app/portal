export const config = {
	env: "remote",
	front: "http://localhost:4200",
	api: "https://localhost:5003",
	signalr: "https://sprint.signalr.sheaft.com",
	content: "https://sprint.content.sheaft.com",
	psp: {
		clientId:"sheaft-sprint",
		url:"https://api.sandbox.mangopay.com"
	},
	auth: {
		url: "https://sprint.auth.sheaft.com",
		settings: {
			client_id: "853edeeac58c440a9140cca350ab8bf8",
			redirect_uri: "http://localhost:4200/#/callback",
			post_logout_redirect_uri: "http://localhost:4200",
			response_type: "code",
			scope: "openid profile email crud role offline_access",
			authority: "https://sprint.auth.sheaft.com",
			silent_redirect_uri: "http://localhost:4200/#/callback-silent",
			automaticSilentRenew: true,
			loadUserInfo: true,
			filterProtocolClaims: true,
			response_mode: "query",
		},
	},
	production: false
};
