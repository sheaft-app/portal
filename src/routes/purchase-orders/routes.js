import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faFileInvoice, faHourglassHalf, faPlus } from "@fortawesome/free-solid-svg-icons";

const prefix = "/purchase-orders";

const list = "/";
const details = "/:id";
const create = "/create";
const history = "/history";

const PurchaseOrderRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value],
	List: {
		Name: "En attente",
		Icon: faHourglassHalf,
		Path: `${prefix}${list}`,
		SubPart: `${list}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "createdOn",
				direction: OrderByDirection.DESC,
				take: 20,
				paginate: Paginate.First,
				refresh: "clear",
			},
		},
	},
	History: {
		Name: "Historique des commandes",
		Icon: faHourglassHalf,
		Path: `${prefix}${history}`,
		SubPart: `${history}`,
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
	Details: {
		Name: "Détails de la commande",
		Icon: faFileInvoice,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		},
	},
	Create: {
		Name: "Nouvelle commande",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
	},
};

export default PurchaseOrderRoutes;
