import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faFileInvoice, faPeopleCarry, faPlus } from "@fortawesome/free-solid-svg-icons";

const prefix = "/retrievals";

const list = "/";
const history = "/history";
const details = "/:id";

const RetrievalRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value],
	List: {
		Name: "Distributions",
		Icon: faPeopleCarry,
		Path: `${prefix}${list}`,
		SubPart: `${list}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "scheduledOn",
				direction: OrderByDirection.DESC,
				take: 20,
				paginate: Paginate.First,
				where: null,
				whereValues: null,
				refresh: "clear",
			},
		},
	},
	History: {
		Name: "Historique des récupérations",
		Icon: faPeopleCarry,
		Path: `${prefix}${history}`,
		SubPart: `${history}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "deliveredOn",
				direction: OrderByDirection.DESC,
				take: 20,
				paginate: Paginate.First,
				where: null,
				whereValues: null,
			},
		},
	},
	Details: {
		Name: "Détails de la récupération",
		Icon: faPeopleCarry,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		},
	},
};

export default RetrievalRoutes;
