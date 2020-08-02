import Roles from "../../enums/Roles";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const prefix = "/cart";

const resume = "/resume";
const success = "/success";

const CartRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Consumer.Value, Roles.Store.Value],
	Resume: {
		Name: "Mon panier",
		Icon: faShoppingCart,
		Path: `${prefix}${resume}`,
		SubPart: `${resume}`,
		Params: null,
	},
	Success: {
		Name: "Succès",
		Icon: faShoppingCart,
		Path: `${prefix}${success}`,
		SubPart: `${success}`,
		Params: {
			Query: { id: null },
		},
	},
};

export default CartRoutes;
