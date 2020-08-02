import gql from "graphql-tag";

export const GET_REGIONS = gql`
	query GetRegions {
		regions {
			nodes {
				id
				code
				name
			}
		}
	}
`;

export const POINTS_PER_COUNTRY = gql`
	query PointsPerCountry {
		pointsPerCountry {
			points
			users
		}
	}
`;

export const POINTS_PER_REGION = gql`
	query PointsPerRegion {
		pointsPerRegion {
			points
			users
			regionId
			regionName
			position
		}
	}
`;

export const POINTS_PER_DEPARTMENT = gql`
	query PointsPerDepartment {
		pointsPerDepartment {
			points
			users
			regionId
			regionName
			departmentId
			departmentName
			code
			position
		}
	}
`;

export const USER_POINTS_PER_COUNTRY = gql`
	query UserPointsPerCountry {
		userPointsPerCountry {
			userId
			points
			name
			picture
			position
		}
	}
`;

export const USER_POINTS_PER_REGION = gql`
	query UserPointsPerRegion {
		userPointsPerRegion {
			userId
			points
			name
			picture
			position
			regionId
		}
	}
`;

export const USER_POINTS_PER_DEPARTMENT = gql`
	query UserPointsPerDepartment {
		userPointsPerDepartment {
			userId
			points
			name
			picture
			position
			departmentId
		}
	}
`;

export const USER_POSITION_IN_COUNTRY = gql`
	query UserPositionInCountry {
	userPositionInCountry {
			points
			position
		}
	}
`;

export const USER_POSITION_IN_REGION = gql`
	query UserPositionInRegion {
	userPositionInRegion {
			points
			position
		}
	}
`;

export const USER_POSITION_IN_DEPARTMENT = gql`
	query UserPositionInDepartment {
	userPositionInDepartment {
			points
			position
		}
	}
`;