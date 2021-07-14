import Roles from "../../enums/Roles";
import { faClock } from "@fortawesome/free-solid-svg-icons";

const prefix = "/preparation";

const listing = "/";
const details = "/:id";
const process = `/process/:id`;
const processProduct = `${details}/product/:productId`;

const PreparationRoutes = {
	Prefix: `${prefix}`,
	Roles: [
		Roles.Producer.Value,
		Roles.Support.Value
	],
	List: {
		Name: "Préparations",
		Icon: faClock,
		Path: `${prefix}${listing}`,
		SubPart: `${listing}`
	},
	Edit: {
		Name: "Modifier la préparation",
		Icon: faClock,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null
		}
	},
	Process: {
		Name: "Préparation en cours",
		Icon: faClock,
		Path: `${prefix}${process}`,
		SubPart: `${process}`,
		Params: {
			id: null
		}
	},
	ProcessProduct: {
		Name: "Préparation en cours - Produit",
		Icon: faClock,
		Path: `${prefix}${processProduct}`,
		SubPart: `${processProduct}`,
		Params: {
			id: null,
			productId: null
		}
	}
};

export default PreparationRoutes;
