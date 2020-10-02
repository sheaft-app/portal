export const GetDistanceInfos = (lat1, lon1, lat2, lon2) => {
	var distance = getDistance(lat1, lon1, lat2, lon2);
	var color = getColorForDistance(distance);
	var label = getLabelForDistance(distance);

	return {
		distance: distance,
		color: color,
		label: label,
	};
}

const getColorForDistance = (distance) => {
	if (isNaN(distance) || distance == null) return "#718096";

	if (distance < 50) return "#009688";

	if (distance >= 50 && distance < 100) return "#48bb78";

	if (distance >= 100 && distance <= 200) return "#ed8936";

	return "#f56565";
}

const getDistance = (lat1, lon1, lat2, lon2) => {
	if (!lat1 || !lon1 || !lat2 || !lon2) {
		return null;
	}

	var p = 0.017453292519943295; // Math.PI / 180
	var c = Math.cos;
	var a =
		0.5 -
		c((lat2 - lat1) * p) / 2 +
		(c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

	return Math.round(12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
}

const getLabelForDistance = (distance) => {
	if (isNaN(distance) || distance == null) return " - km";
	if (distance < 1) return "< 1km";

	return Math.round(distance).toString() + "km";
}
