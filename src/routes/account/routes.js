import Roles from "../../enums/Roles";
import { faUser, faBuilding } from "@fortawesome/free-solid-svg-icons";

const prefix = "/account";

const profile = "/profile";
const company = "/company";

const AccountRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Store.Value, Roles.Producer.Value, Roles.Consumer.Value],
	Profile: {
		Name: "Profil",
		Icon: faUser,
		Path: `${prefix}${profile}`,
		SubPart: `${profile}`,
	},
	Company: {
		Name: "Ma société",
		Icon: faBuilding,
		Path: `${prefix}${company}`,
		SubPart: `${company}`,
	},
};

export default AccountRoutes;
