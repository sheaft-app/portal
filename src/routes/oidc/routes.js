const callback = "/callback";
const silentCallback = "/callback-silent";

const OidcRoutes = {
	Prefix: null,
	Roles: null,
	Callback: {
		Name: "Retour serveur d'authentification",
		Icon: null,
		Path: `${callback}`,
		SubPart: `${callback}`,
		Params: null,
	},
	CallbackSilent: {
		Name: "Retour du serveur d'authentification",
		Icon: null,
		Path: `${silentCallback}`,
		SubPart: `${silentCallback}`,
		Params: null,
	},
};

export default OidcRoutes;
