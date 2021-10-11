export const config = {
	env: "production",
	front: "https://app.sheaft.com",
	api: "https://api.sheaft.com",
	signalr: "https://signalr.sheaft.com",
	content: "https://content.sheaft.com",
	psp: {
		clientId: "sheaft-production",
		url: "https://api.mangopay.com",
	},
	auth: {
		url: "https://auth.sheaft.com",
		settings: {
			client_id: "990966C64E554C6298970F5D6FBEEDEA",
			redirect_uri: "https://app.sheaft.com/#/callback",
			post_logout_redirect_uri: "https://app.sheaft.com",
			response_type: "code",
			scope: "openid profile email crud role offline_access",
			authority: "https://auth.sheaft.com",
			silent_redirect_uri: "https://app.sheaft.com/#/callback-silent",
			automaticSilentRenew: true,
			loadUserInfo: true,
			filterProtocolClaims: true,
			response_mode: "query",
		},
	},
	production: true,
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
