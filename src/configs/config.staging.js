export const config = {
	env: "production",
	front: "https://staging.app.sheaft.com",
	api: "https://staging.api.sheaft.com",
	signalr: "https://staging.signalr.sheaft.com",
	content: "https://staging.content.sheaft.com",
	psp: {
		clientId: "sheaft-staging",
		url: "https://api.sandbox.mangopay.com",
	},
	auth: {
		url: "https://staging.auth.sheaft.com",
		settings: {
			client_id: "eec657c2718742208bf0a5a965f04eca",
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
	production: false,
	roles: {
		admin: {
			value: "ADMIN",
			label: "Administrateur",
		},
		support: {
			value: "SUPPORT",
			label: "Support",
		},
		owner: {
			value: "OWNER",
			label: "Propriétaire",
		},
		store: {
			id: "f81030de",
			value: "STORE",
			label: "Commerce",
		},
		producer: {
			id: "e4a370fe",
			value: "PRODUCER",
			label: "Producteur",
		},
		consumer: {
			id: "",
			value: "CONSUMER",
			label: "Consommateur",
		},
		anonymous: {
			value: "ANONYMOUS",
			label: "Anonyme",
		},
		registered: {
			value: "REGISTERED",
			label: "Enregistré",
		},
	},
};
