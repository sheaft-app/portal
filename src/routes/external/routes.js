import Roles from "../../enums/Roles";
import { faSearch, faStore } from "@fortawesome/free-solid-svg-icons";

const prefix = "/details";

const productDetails = "/products/:id";
const producerDetails = "/producers/:id";
const storeDetails = "/stores/:id";

const ExternalRoutes = {
	Prefix: `${prefix}`,
	Roles: [
		Roles.Anonymous.Value,
		Roles.Consumer.Value,
		Roles.Admin.Value,
		Roles.Producer.Value,
		Roles.Store.Value,
		Roles.Support.Value,
	],
	ProductDetails: {
		Name: "Détails du produit",
		Icon: faSearch,
		Path: `${prefix}${productDetails}`,
		SubPart: `${productDetails}`,
		Params: {
			id: null,
		},
	},
	ProducerDetails: {
		Name: "Ma boutique",
		Icon: faStore,
		Path: `${prefix}${producerDetails}`,
		SubPart: `${producerDetails}`,
		Params: {
			id: null,
		},
	},
	StoreDetails: {
		Name: "Mon magasin",
		Icon: faStore,
		Path: `${prefix}${storeDetails}`,
		SubPart: `${storeDetails}`,
		Params: {
			id: null,
		},
	},
};

export default ExternalRoutes;
