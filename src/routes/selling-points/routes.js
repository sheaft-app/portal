import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faMapMarkerAlt, faPlus, faEdit } from "@fortawesome/free-solid-svg-icons";

const prefix = "/selling-points";

const list = "/";
const create = "/create";
const details = "/:id";

const SellingPointRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value],
	List: {
		Name: "Points de vente",
		Icon: faMapMarkerAlt,
		Path: `${prefix}${list}`,
		SubPart: `${list}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "name",
				direction: OrderByDirection.ASC,
				take: 20,
				paginate: Paginate.First,
			},
		},
	},
	Create: {
		Name: "Nouveau point de vente",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
	},
	Details: {
		Name: "Editer le point de vente",
		Icon: faEdit,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		},
	},
	NoResults: {
		Name: "Ajouter un point de vente",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
		Text: "Aucun point de vente disponible",
	},
};

export default SellingPointRoutes;
