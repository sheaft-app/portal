import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faFileInvoice } from "@fortawesome/free-solid-svg-icons";

const prefix = "/purchase-orders";

const list = "/";
const details = "/:id";

const PurchaseOrderRoutes = {
	Prefix: `${prefix}`,
	Roles:[Roles.Producer.Value],
	List: {
		Name: "Commandes",
		Icon: faFileInvoice,
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
		}
	},
	Details: {
		Name: "Détails de la commande",
		Icon: faFileInvoice,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		}
	}
};

export default PurchaseOrderRoutes;
