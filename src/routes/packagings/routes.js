import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faCube, faPlus, faEdit } from "@fortawesome/free-solid-svg-icons";

const prefix = "/packagings";

const list = "/";
const create = "/create";
const details = "/:id";

const PackagingRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value],
	List: {
		Name: "Consignes",
		Icon: faCube,
		Path: `${prefix}${list}`,
		SubPart: `${list}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "name",
				direction: OrderByDirection.ASC,
				take: 20,
				paginate: Paginate.First
			}
		}
	},
	Create: {
		Name: "Nouvelle consigne",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null
	},
	Details: {
		Name: "Editer une consigne",
		Icon: faEdit,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		}
	},
};

export default PackagingRoutes;
