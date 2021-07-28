import Roles from "../../enums/Roles";
import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import { faFileSignature } from "@fortawesome/free-solid-svg-icons";

const prefix = "/store-traceability";
const traceability = "/";

const StoreTraceabilityRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Store.Value, Roles.Support.Value],
	List: {
		Name: "Traçabilité",
		Icon: faFileSignature,
		Path: `${prefix}${traceability}`,
		SubPart: `${traceability}`,
		Params: {
			Query: {
				cursor: null,
				orderBy: "createdOn",
				direction: OrderByDirection.DESC,
				take: 20,
				paginate: Paginate.First,
				where: null,
				whereValues: null,
				refresh: "clear",
			},
		},
	},
};

export default StoreTraceabilityRoutes;
