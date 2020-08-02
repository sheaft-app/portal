import Roles from "../../enums/Roles";
import { faFighterJet } from "@fortawesome/free-solid-svg-icons";

const prefix = "/quick-orders";

const purchase = "/purchase";

const QuickOrderRoutes = {
	Prefix: `${prefix}`,
	Roles:[Roles.Store.Value],
	Purchase: {
		Name: "Passer commande",
		Icon: faFighterJet,
		Path: `${prefix}${purchase}`,
		SubPart: `${purchase}`
	}
};

export default QuickOrderRoutes;
