import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faClock, faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";

const prefix = "/billings";

const list = "/";
const details = "/:id";

const BillingRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value],
	List: {
		Name: "A facturer",
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
};

export default BillingRoutes;
