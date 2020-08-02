import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const prefix = "/my-orders";

const list = "/";
const details = "/:id";

const MyOrderRoutes = {
	Prefix: `${prefix}`,
	Roles:[Roles.Consumer.Value, Roles.Store.Value],
	List: {
		Name: "Mes commandes",
		Icon: faShoppingCart,
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
		Name: "Détail de la commande",
		Icon: faShoppingCart,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		}
	}
};

export default MyOrderRoutes;
