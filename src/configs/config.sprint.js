export const config = {
	env: "production",
	front: "https://sprint.app.sheaft.com",
	api: "https://sprint.api.sheaft.com",
	signalr: "https://sprint.signalr.sheaft.com",
	content: "https://sprint.content.sheaft.com",
	auth: {
		url: "https://sprint.auth.sheaft.com",
		settings: {
			client_id: "853edeeac58c440a9140cca350ab8bf8",
			redirect_uri: "https://sprint.app.sheaft.com/#/callback",
			post_logout_redirect_uri: "https://sprint.app.sheaft.com",
			response_type: "code",
			scope: "openid profile email crud role offline_access",
			authority: "https://sprint.auth.sheaft.com",
			silent_redirect_uri: "https://sprint.app.sheaft.com/#/callback-silent",
			automaticSilentRenew: true,
			loadUserInfo: true,
			filterProtocolClaims: true,
			response_mode: "query",
		},
	},
	production: true
};
