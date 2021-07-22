import Roles from "../../enums/Roles";
import { faCartPlus, faPlus, faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const prefix = "/";

const purchase = "/purchase";
const quickPurchase = "/quick-purchase";

const QuickPurchaseRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Store.Value],
	Purchase: {
		Name: "Passer commande",
		Icon: faShoppingCart,
		Path: `${purchase}`,
		SubPart: `${purchase}`,
	},
	Quick: {
		Name: "Commande rapide",
		Icon: faCartPlus,
		Path: `${quickPurchase}`,
		SubPart: `${quickPurchase}`,
	},
};

export default QuickPurchaseRoutes;
