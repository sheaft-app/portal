import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faClock, faFileInvoiceDollar, faPlus, faTruckLoading } from "@fortawesome/free-solid-svg-icons";

const prefix = "/expected-deliveries";

const list = "/";
const history = "/history";
const details = "/:id";

const ExpectedDeliveriesRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Store.Value],
	List: {
		Name: "A Réceptionner",
		Icon: faTruckLoading,
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
			},
		},
	},
	Details: {
		Name: "Livraison",
		Icon: faClock,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		},
	},
	History: {
		Name: "Historique",
		Icon: faClock,
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
	NoResults: {
		Text: "Vous n'avez pas de livraisons à réceptionner.",
	},
};

export default ExpectedDeliveriesRoutes;
