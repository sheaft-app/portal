import Roles from "../../enums/Roles";
import { faHandshake } from "@fortawesome/free-solid-svg-icons";

const prefix = "/agreements";
const list = "/";
const details = "/:id";

const AgreementRoutes = {
	Prefix: `${prefix}`,
	Roles:[Roles.Store.Value, Roles.Producer.Value],
	List: {
		Name: "Accords",
		Icon: faHandshake,
		Path: `${prefix}${list}`,
		SubPart: `${list}`
	},
	Details: {
		Name: "Détails de l'accord",
		Icon: faHandshake,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		}
	}
};

export default AgreementRoutes;
