export const config = {
	env: "local",
	front: "http://localhost:4200",
	api: "http://localhost:5002",
	signalr: "http://localhost:5009",
	content: "http://localhost:10000/devstoreaccount1",
	auth: {
		url: "http://localhost:5000",
		settings: {
			client_id: "97e3f4c0-62fa-4ee3-bad8-c23f7b0033b7",
			redirect_uri: "http://localhost:4200/#/callback",
			post_logout_redirect_uri: "http://localhost:4200",
			response_type: "code",
			scope: "openid profile email crud role offline_access",
			authority: "http://localhost:5000",
			silent_redirect_uri: "http://localhost:4200/#/callback-silent",
			automaticSilentRenew: true,
			loadUserInfo: true,
			filterProtocolClaims: true,
			response_mode: "query",
		},
	},
	production: false
};
