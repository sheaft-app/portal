import Roles from "../../enums/Roles";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

const prefix = "/cart";

const resume = "/resume";
const success = "/success";
const checkout = "/checkout";

const CartRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Consumer.Value, Roles.Store.Value],
	Resume: {
		Name: "Mon panier",
		Icon: faShoppingCart,
		Path: `${prefix}${resume}`,
		SubPart: `${resume}`,
		Params: {
			Query: {
				step: "cart"
			}
		},
	},
	Success: {
		Name: "Succès",
		Roles: [Roles.Consumer.Value, Roles.Store.Value],
		Icon: faShoppingCart,
		Path: `${prefix}${success}`,
		SubPart: `${success}`,
		Params: {
			Query: { id: null },
		},
	},
	Checkout: {
		Name: "Paiement",
		Roles: [Roles.Consumer.Value, Roles.Store.Value],
		Icon: faShoppingCart,
		Path: `${prefix}${checkout}`,
		SubPart: `${checkout}`,
		Params: null,
	}
};

export default CartRoutes;
