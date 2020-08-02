import { faCrown } from "@fortawesome/free-solid-svg-icons";

const prefix = "/leaderboard";
const country = "";

const LeaderboardRoutes = {
	Prefix: `${prefix}`,
	Roles: null,
	Country: {
		Name: "Classement",
		Icon: faCrown,
		Path: `${prefix}${country}`,
		SubPart: `${country}`,
		Params: null
	}
};

export default LeaderboardRoutes;
