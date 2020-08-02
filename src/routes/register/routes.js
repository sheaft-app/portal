import Roles from "../../enums/Roles";

const prefix = "/register";

const owner = "/owner/:id";
const consumer = "/consumer";
const choose = "/choose";

const RegisterRoutes = {
	Prefix: `${prefix}`,
	Roles:[Roles.Anonymous.Value],
	Owner: {
		Name: "Enregistrement de la société",
		Icon: null,
		Path: `${prefix}${owner}`,
		SubPart: `${owner}`,
		Params: {
			id: null,
		}
	},	
	Choose: {
		Name: "Choix du type de compte",
		Icon: null,
		Path: `${prefix}${choose}`,
		SubPart: `${choose}`,
	},
	Consumer: {
		Name: "Enregistrement consommateur",
		Icon: null,
		Path: `${prefix}${consumer}`,
		SubPart: `${consumer}`,
	}
};

export default RegisterRoutes;
