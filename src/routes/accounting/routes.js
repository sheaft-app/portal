import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faClock, faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";

const prefix = "/accounting";

const list = "/";
const details = "/:id";

const AccountingRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value],
	List: {
		Name: "A Facturer",
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
		Name: "Détails de la livraison",
		Icon: faClock,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		},
	},
};

export default AccountingRoutes;
