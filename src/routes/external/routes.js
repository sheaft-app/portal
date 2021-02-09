import Roles from "../../enums/Roles";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const prefix = "/details";

const productDetails = "/products/:id";
const producerDetails = "/producers/:id";

const ExternalRoutes = {
	Prefix: `${prefix}`,
	Roles:[Roles.Anonymous.Value, Roles.Consumer.Value, Roles.Admin.Value, Roles.Producer.Value, Roles.Store.Value, Roles.Support.Value],
	ProductDetails: {
		Name: "Détails du produit",
		Icon: faSearch,
		Path: `${prefix}${productDetails}`,
		SubPart: `${productDetails}`,
		Params: {
			id: null,
		}
	},
	ProducerDetails: {
		Name: "Détails du producteur",
		Icon: faSearch,
		Path: `${prefix}${producerDetails}`,
		SubPart: `${producerDetails}`,
		Params: {
			id: null,
		}
	}
};

export default ExternalRoutes;
