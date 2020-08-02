const prefix = "/";
const unauthorized = "/unauthorized";
const error = "/error";
const notFound = "/notfound";

const HomeRoutes = {
	Prefix: `${prefix}`,
	Roles:null,
	Unauthorized:{
		Name: "Accès non authorisé",
		Icon: null,
		Path:`${unauthorized}`,
		SubPart:`${unauthorized}`,
		Params: null
	},
	Error:{
		Name: "Erreur",
		Icon: null,
		Path:`${error}`,
		SubPart:`${error}`,
		Params: null
	},
	NotFound:{
		Name: "Ressource introuvable",
		Icon: null,
		Path:`${notFound}`,
		SubPart:`${notFound}`,
		Params: null
	},
};

export default HomeRoutes;
