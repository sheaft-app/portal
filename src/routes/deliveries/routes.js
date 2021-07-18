import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faClock } from "@fortawesome/free-solid-svg-icons";

const prefix = "/deliveries";

const list = "/";
const create = "/create";
const details = "/:id";

const DeliveryRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value],
	List: {
		Name: "Créneaux livraison",
		Icon: faClock,
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
		Name: "Créer un nouveau créneau",
		Icon: faClock,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
	},
	Details: {
		Name: "Editer un créneau",
		Icon: faClock,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		},
	},
	NoResults: {
		Name: "Ajouter un nouveau créneau",
		Icon: faClock,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
		Text: "Aucun créneau disponible",
	},
};

export default DeliveryRoutes;
