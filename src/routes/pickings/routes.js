import Roles from "../../enums/Roles";
import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";

const prefix = "/pickings";

const listing = "/";
const history = "/history";
const summary = "/summary/:id";
const details = "/:id";
const process = `${details}/process`;
const processProduct = `${process}/:productId`;

const PickingRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value, Roles.Support.Value],
	List: {
		Name: "Préparations",
		Icon: faClipboardList,
		Path: `${prefix}${listing}`,
		SubPart: `${listing}`,
	},
	History: {
		Name: "Historique préparations",
		Icon: null,
		Path: `${prefix}${history}`,
		SubPart: `${history}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "startedOn",
				direction: OrderByDirection.DESC,
				take: 20,
				paginate: Paginate.First,
				where: null,
				whereValues: null,
			},
		},
	},
	Summary: {
		Name: "Résumé préparation",
		Icon: null,
		Path: `${prefix}${summary}`,
		SubPart: `${summary}`,
		Params: {
			id: null,
		},
	},
	Edit: {
		Name: "Modifier la préparation",
		Icon: faClipboardList,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		},
	},
	Process: {
		Name: "Préparation en cours",
		Icon: faClipboardList,
		Path: `${prefix}${process}`,
		SubPart: `${process}`,
		Params: {
			id: null,
		},
	},
	ProcessProduct: {
		Name: "Préparation en cours - Produit",
		Icon: faClipboardList,
		Path: `${prefix}${processProduct}`,
		SubPart: `${processProduct}`,
		Params: {
			id: null,
			productId: null,
		},
	},
};

export default PickingRoutes;
