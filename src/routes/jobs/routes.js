import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faTasks } from "@fortawesome/free-solid-svg-icons";

const prefix = "/jobs";

const list = "/";
const details = "/:id";

const JobRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value, Roles.Store.Value, Roles.Consumer.Value],
	List: {
		Name: "Tâches de fond",
		Icon: faTasks,
		Path: `${prefix}${list}`,
		SubPart: `${list}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "createdOn",
				direction: OrderByDirection.DESC,
				take: 20,
				paginate: Paginate.First,
			},
		},
	},
	Details: {
		Name: "Détails de la tâche de fond",
		Icon: faTasks,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		},
	},
};

export default JobRoutes;
