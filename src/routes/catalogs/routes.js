import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faTags, faPlus, faEdit } from "@fortawesome/free-solid-svg-icons";

const prefix = "/catalogs";

const list = "/";
const create = "/create";
const details = "/:id";

const CatalogRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value],
	List: {
		Name: "Catalogues",
		Icon: faTags,
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
		Name: "Créer un catalogue",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
	},
	Details: {
		Name: "Editer un catalogue",
		Icon: faEdit,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		}
	},
	NoResults: {
		Name: "Créer un catalogue",
		Text: "Vous n'avez pas encore de catalogue.",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
	},
};

export default CatalogRoutes;
