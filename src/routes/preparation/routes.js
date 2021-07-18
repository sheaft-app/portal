import Roles from "../../enums/Roles";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";

const prefix = "/preparations";

const listing = "/";
const details = "/:id";
const process = `${details}/process`;
const processProduct = `${process}/:productId`;

const PreparationRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value, Roles.Support.Value],
	List: {
		Name: "Préparations",
		Icon: faClipboardList,
		Path: `${prefix}${listing}`,
		SubPart: `${listing}`,
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

export default PreparationRoutes;
