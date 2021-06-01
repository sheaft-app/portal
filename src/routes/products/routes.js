import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faBarcode, faPlus, faEdit, faStar } from "@fortawesome/free-solid-svg-icons";

const prefix = "/products";

const list = "/";
const create = "/create";
const details = "/:id";
const ratings = "/:id/ratings";

const ProductRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value],
	List: {
		Name: "Produits",
		Icon: faBarcode,
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
		Name: "Créer un produit",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
	},
	Details: {
		Name: "Editer un produit",
		Icon: faEdit,
		Path: `${prefix}${details}`,
		SubPart: `${details}`,
		Params: {
			id: null,
		},
	},
	Ratings: {
		Name: "Notation du produit",
		Icon: faStar,
		Path: `${prefix}${ratings}`,
		SubPart: `${ratings}`,
		Params: {
			id: null,
		},
	},
	NoResults: {
		Name: "Créer un produit",
		Icon: faPlus,
		Path: `${prefix}${create}`,
		SubPart: `${create}`,
		Params: null,
		Text: "Vous n'avez pas encore de produits dans votre catalogue.",
	},
};

export default ProductRoutes;
