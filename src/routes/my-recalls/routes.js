import Roles from "../../enums/Roles";
import { faExclamationTriangle, faEye, faPen, faPlus } from "@fortawesome/free-solid-svg-icons";
import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";

const prefix = "/my-recalls";

const list = "/";

const MyRecallRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Store.Value, Roles.Consumer.Value, Roles.Anonymous.Value],
	List: {
		Name: "Rappels",
		Icon: faExclamationTriangle,
		Path: `${prefix}${list}`,
		SubPart: `${list}`,
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
	NoResults: {
		Text: "Vous n'avez pas encore de campagne de rappel.",
	},
};

export default MyRecallRoutes;
