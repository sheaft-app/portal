export const config = {
	env: "{ENVIRONMENT}",
	front: "{FRONT_URL}",
	api: "{API_URL}",
	signalr: "{SIGNALR_URL}",
	content: "{STORAGE_URL}",
	psp: {
		clientId: "{PSP_CLIENT_ID}",
		url: "{PSP_URL}",
	},
	auth: {
		url: "{AUTH_URL}",
		settings: {
			client_id: "{AUTH_CLIENT_ID}",
			redirect_uri: "{FRONT_URL}/#/callback",
			post_logout_redirect_uri: "{FRONT_URL}",
			response_type: "code",
			scope: "openid profile email crud role offline_access",
			authority: "{AUTH_URL}",
			silent_redirect_uri: "{FRONT_URL}/#/callback-silent",
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
