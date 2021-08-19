import Roles from "../../enums/Roles";
import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import { faTruck, faEdit, faPlus, faPlay, faHistory } from "@fortawesome/free-solid-svg-icons";

const prefix = "/delivery-batches";

const listing = "/";
const history = "/history";
const summary = "/summary/:id";
const create = "/create";
const edit = "/:id";
const deliver = "/deliver/:id";
const deliveryMode = "/delivery-mode/:id";
const flatDelivery = "/flat-delivery/:id";
const nextDelivery = `${deliver}/next`;
const endDelivery = `${deliver}/end`;

const DeliveryBatchesRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value, Roles.Support.Value],
	List: {
		Name: "Livraisons",
		Icon: faTruck,
		Path: `${prefix}${listing}`,
		SubPart: `${listing}`,
		Params: {
			Query: {
				selectModal: null,
			},
		},
	},
	History: {
		Name: "Historique livraisons",
		Icon: faHistory,
		Path: `${prefix}${history}`,
		SubPart: `${history}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "scheduledOn",
				direction: OrderByDirection.DESC,
				take: 20,
				paginate: Paginate.First,
				where: null,
				whereValues: null,
			},
		},
	},
	Summary: {
		Name: "Résumé livraison",
		Icon: faHistory,
		Path: `${prefix}${summary}`,
		SubPart: `${summary}`,
		Params: {
			id: null,
		},
	},
	Create: {
		Name: "Programmer une livraison",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
	},
	Edit: {
		Name: "Modifier une livraison programmée",
		Icon: faEdit,
		Path: `${prefix}${edit}`,
		SubPart: `${edit}`,
		Params: {
			id: null,
		},
	},
	Process: {
		Name: "Livraison",
		Icon: faPlay,
		Path: `${prefix}${deliver}`,
		SubPart: `${deliver}`,
		Params: {
			id: null,
		},
	},
	PickDeliveryMode: {
		Name: "Choisissez un mode de livraison",
		Icon: faPlay,
		Path: `${prefix}${deliveryMode}`,
		SubPart: `${deliveryMode}`,
		Params: {
			id: null,
		},
	},
	FlatProcess: {
		Name: "Bilan de livraison",
		Icon: faPlay,
		Path: `${prefix}${flatDelivery}`,
		SubPart: `${flatDelivery}`,
		Params: {
			id: null,
		},
	},
	NextDelivery: {
		Name: "Choisir la livraison suivante",
		Icon: null,
		Path: `${prefix}${nextDelivery}`,
		SubPart: `${nextDelivery}`,
		Params: {
			id: null,
		},
	},
	EndDelivery: {
		Name: "Fin de la livraison",
		Icon: null,
		Path: `${prefix}${endDelivery}`,
		SubPart: `${endDelivery}`,
		Params: {
			id: null,
		},
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
