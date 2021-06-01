import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faCube, faPlus, faEdit } from "@fortawesome/free-solid-svg-icons";

const prefix = "/returnables";

const list = "/";
const create = "/create";
const details = "/:id";

const ReturnableRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value],
	List: {
		Name: "Consignes",
		Icon: faCube,
		Path: `${prefix}${list}`,
		SubPart: `${list}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "name",
				direction: OrderByDirection.ASC,
				take: 20,
				paginate: Paginate.First,
			},
		},
	},
	Create: {
		Name: "Nouvelle consigne",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
	},
	Details: {
		Name: "Editer une consigne",
		Icon: faEdit,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		},
	},
	NoResults: {
		Name: "Créer une consigne",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
		Text: "Vous n'avez aucune consigne",
	},
};

export default ReturnableRoutes;
