import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faStore } from "@fortawesome/free-solid-svg-icons";

const prefix = "/stores";
const search = "";

const SearchStoreRoutes = {
	Prefix: `${prefix}`,
	Roles:[Roles.Producer.Value],
	Search: {
		Name: "Magasins",
		Icon: faStore,
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
		Name: "Trouver des magasins",
		Icon: faStore,
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

export default SearchStoreRoutes;
