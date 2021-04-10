import Roles from "../../enums/Roles";
import { faUser, faBuilding } from "@fortawesome/free-solid-svg-icons";

const prefix = "/account";

const profile = "/profile";

const AccountRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Store.Value, Roles.Producer.Value, Roles.Consumer.Value],
	Profile: {
		Name: "Mon profil",
		Icon: faUser,
		Path: `${prefix}${profile}`,
		SubPart: `${profile}`,
	}
};

export default AccountRoutes;
