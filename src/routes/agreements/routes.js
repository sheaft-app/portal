import Roles from "../../enums/Roles";
import {faHandshake} from "@fortawesome/free-solid-svg-icons";
import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";

const prefix = "/agreements";
const list = "/";
const details = "/:id";

const AgreementRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Store.Value, Roles.Producer.Value],
	List: {
		Name: "Accords",
		Icon: faHandshake,
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
				whereValues: null
			},
		},
	},
	Details: {
		Name: "Détails de l'accord",
		Icon: faHandshake,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		}
	}
};

export default AgreementRoutes;
