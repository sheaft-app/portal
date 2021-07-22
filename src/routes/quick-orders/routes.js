import Roles from "../../enums/Roles";
import {
	faCartPlus,
	faClipboardCheck,
	faClipboardList,
	faPen,
	faPlus,
	faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";

const prefix = "/quick-orders";

const list = "/";
const create = "/create";
const edit = "/:id";

const QuickOrderRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Store.Value],
	List: {
		Name: "Modèles",
		Icon: faClipboardList,
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
		Name: "Créer un modèle de commande",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
	},
	Edit: {
		Name: "Editer un modèle de commande",
		Icon: faPen,
		Path: `${prefix}${edit}`,
		SubPart: `${edit}`,
		Params: {
			id: null,
		},
	},
	NoResults: {
		Name: "Créer un modèle de commande",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
		Text: "Vous n'avez pas encore de modèle de commande.",
	},
};

export default QuickOrderRoutes;
