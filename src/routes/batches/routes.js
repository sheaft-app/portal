import { faFileSignature } from "@fortawesome/free-solid-svg-icons";

import OrderByDirection from "../../enums/OrderByDirection";
import Paginate from "../../enums/Paginate";
import Roles from "../../enums/Roles";

const prefix = "/traceability";
const batches = "/";
const batchDetails = "/batch/:id";

const BatchesRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Producer.Value, Roles.Store.Value, Roles.Support.Value],
	List: {
		Name: "Traçabilité",
		Icon: faFileSignature,
		Path: `${prefix}${batches}`,
		SubPart: `${batches}`,
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
				observationId: null,
			},
		},
	},
	BatchDetails: {
		Name: "Détails lot",
		Icon: null,
		Path: `${prefix}${batchDetails}`,
		SubPart: `${batchDetails}`,
		Params: {
			id: null,
		},
	},
};

export default BatchesRoutes;
