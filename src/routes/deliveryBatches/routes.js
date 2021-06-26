import Roles from "../../enums/Roles";
import { faClock, faEdit, faPlus, faPlay } from "@fortawesome/free-solid-svg-icons";

const prefix = "/delivery-batches";

const listing = "/";
const create = "/create";
const edit = "/:id";
const deliver = "/deliver/:id";

const DeliveryBatchesRoutes = {
	Prefix: `${prefix}`,
	Roles: [
		Roles.Producer.Value,
		Roles.Support.Value
	],
	List: {
		Name: "Livraisons programmées",
		Icon: faClock,
		Path: `${prefix}${listing}`,
		SubPart: `${listing}`
	},
	Create: {
		Name: "Programmer une livraison",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null
	},
	Edit: {
		Name: "Modifier une livraison programmée",
		Icon: faEdit,
		Path: `${prefix}${edit}`,
		SubPart: `${edit}`,
		Params: {
			id: null
		}
	},
	Process: {
		Name: "Livraison",
		Icon: faPlay,
		Path: `${prefix}${deliver}`,
		SubPart: `${deliver}`,
		Params: {
			id: null
		}
	},
	NoResults: {
		Name: "Programmer une livraison",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
		Text: "Aucune livraison à venir",
	},
};

export default DeliveryBatchesRoutes;
