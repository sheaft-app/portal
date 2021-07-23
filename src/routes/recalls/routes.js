import Roles from "../../enums/Roles";
import { faExclamationTriangle, faEye, faPen, faPlus } from "@fortawesome/free-solid-svg-icons";
import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";

const prefix = "/recalls";

const list = "/";
const create = "/create";
const edit = "/:id";

const RecallRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Store.Value, Roles.Producer.Value],
	List: {
		Name: "Rappels",
		Icon: faExclamationTriangle,
		Path: `${prefix}${list}`,
		SubPart: `${list}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "createdOn",
				direction: OrderByDirection.DESC,
				take: 20,
				paginate: Paginate.First,
				where: null,
				whereValues: null,
			},
		},
	},
	Create: {
		Name: "Créer une campagne de rappel",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
	},
	Edit: {
		Name: "Editer une campagne de rappel",
		Icon: faPen,
		Path: `${prefix}${edit}`,
		SubPart: `${edit}`,
		Params: {
			id: null,
		},
	},
	NoResults: {
		Name: "Créer une campagne de rappel",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
		Text: "Vous n'avez pas encore de campagne de rappel.",
	},
};

export default RecallRoutes;
