import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faClock, faFileInvoiceDollar, faPlus } from "@fortawesome/free-solid-svg-icons";

const prefix = "/billings";

const list = "/";
const history = "/history";
const details = "/:id";

const BillingRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value],
	List: {
		Name: "À facturer",
		Icon: faFileInvoiceDollar,
		Path: `${prefix}${list}`,
		SubPart: `${list}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "deliveredOn",
				direction: OrderByDirection.DESC,
				take: 20,
				paginate: Paginate.First,
				where: null,
				whereValues: null,
				refresh: "clear",
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
				orderBy: "billedOn",
				direction: OrderByDirection.DESC,
				take: 20,
				paginate: Paginate.First,
				where: null,
				whereValues: null,
			},
		},
	},
	NoResults: {
		Text: "Vous n'avez pas de livraisons à facturer.",
	},
};

export default BillingRoutes;
