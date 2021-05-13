import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import {faStore, faTractor} from "@fortawesome/free-solid-svg-icons";

const prefix = "/producers";
const search = "";

const SearchProducerRoutes = {
	Prefix: `${prefix}`,
	Roles:[Roles.Store.Value],
	Search: {
		Name: "Producteurs",
		Icon: faTractor,
		Path: `${prefix}${search}`,
		SubPart: `${search}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "createdOn",
				direction: OrderByDirection.DESC,
				take: 20,
				paginate: Paginate.First
			}
		},
	},
	NoResultsPage: {
		Name: "Trouver des producteurs",
		Icon: faTractor,
		Path: `${prefix}${search}`,
		SubPart: `${search}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "createdOn",
				direction: OrderByDirection.DESC,
				take: 20,
				paginate: Paginate.First
			}
		},
		Text: "Aucun partenariat avec des magasins"
	}
};

export default SearchProducerRoutes;
