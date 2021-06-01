import Roles from "../../enums/Roles";
import { faHandHoldingHeart } from "@fortawesome/free-solid-svg-icons";

const prefix = "/sponsorship";

const share = "/share";

const SponsorshipRoutes = {
	Prefix: `${prefix}`,
	Roles: [Roles.Store.Value, Roles.Consumer.Value, Roles.Producer.Value],
	Share: {
		Name: "Parrainage",
		Icon: faHandHoldingHeart,
		Path: `${prefix}${share}`,
		SubPart: `${share}`,
		Params: null,
	},
};

export default SponsorshipRoutes;
