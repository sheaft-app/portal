import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const prefix = "/search";
const search = "";

const SearchProductRoutes = {
	Prefix: `${prefix}`,
	Roles:[Roles.Anonymous.Value, Roles.Consumer.Value],
	Search: {
		Name: "Explorer",
		Icon: faSearch,
		Path: `${prefix}${search}`,
		SubPart: `${search}`,
		Params: {
			Query: {
				cursor: null,
				sort: "producer_geolocation asc",
				direction: OrderByDirection.ASC,
				take: 20,
				paginate: Paginate.First
			}
		},
	}
};

export default SearchProductRoutes;
