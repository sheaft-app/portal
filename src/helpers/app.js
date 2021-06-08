import Guid from "./Guid";
import ConditioningKind from "../enums/ConditioningKind";
import DayOfWeekKind from "../enums/DayOfWeekKind";
import orderBy from "lodash/orderBy";

export const timeSpanToFrenchHour = (timeSpan) => {
	if (!timeSpan) {
		return;
	}

	const result =
		/^P(?!$)((?<years>\d+)Y)?((?<months>\d+)M)?((?<weeks>\d+)W)?((?<days>\d+)D)?(T(?=\d+[HMS])((?<hours>\d+)H)?((?<minutes>\d+)M)?((?<seconds>\d+)S)?)?$/.exec(
			timeSpan
		);
	return `${result.groups.hours}h${result.groups.minutes ?? ""}`;
};
export const timeToTimeSpan = (time) =>
	`PT${time.hours ? `${time.hours}H` : ""}${time.minutes ? `${time.minutes}M` : ""}${
		time.seconds ? `${time.seconds}S` : ""
	}`;

export const timeSpanToTime = (timeSpan) => {
	if (!timeSpan) {
		return {
			hours: "0",
			minutes: "0",
			seconds: "0",
		};
	}

	const result =
		/^P(?!$)((?<years>\d+)Y)?((?<months>\d+)M)?((?<weeks>\d+)W)?((?<days>\d+)D)?(T(?=\d+[HMS])((?<hours>\d+)H)?((?<minutes>\d+)M)?((?<seconds>\d+)S)?)?$/.exec(
			timeSpan
		);
	return {
		hours: result.groups.hours ? result.groups.hours : "0",
		minutes: result.groups.minutes ? result.groups.minutes : "0",
		seconds: result.groups.seconds ? result.groups.seconds : "0",
	};
};

export const groupBy = (array, f) => {
	if (!array || array.length < 1) return [];

	var groups = {};
	array.forEach((o) => {
		var group = JSON.stringify(f(o));
		groups[group] = groups[group] || [];
		groups[group].push(o);
	});

	return Object.keys(groups).map((group) => groups[group]);
};

export const getDefaultDenormalizedOpeningHours = () =>
	denormalizeOpeningHours([
		{
			id: 0,
			days: [],
			from: null,
			to: null,
		},
	]);

export const denormalizeOpeningHours = (openingHours) =>
	groupBy(openingHours, (item) => [item.from, item.to]).map((group) => {
		let days = [];

		for (var i = 0; i <= group.length; i++) {
			if (group[i] && group[i].day) {
				days = days.concat({
					...DayOfWeekKind.get(group[i].day),
					checked: true,
				});
			}
		}

		if (days.length < 6) {
			days = [
				...days,
				...DayOfWeekKind.getDaysWithIndexNotIn(days.map((d) => d.Index)).map((d) => {
					return {
						...d,
						checked: false,
					};
				}),
			];
		}

		return {
			id: Guid.NewGuid(),
			days: orderBy(days, (i) => i.Index, ["asc"]),
			start: timeSpanToTime(group[0] ? group[0].from : timeSpanToTime(null)),
			end: timeSpanToTime(group[0] ? group[0].to : timeSpanToTime(null)),
		};
	});

export const normalizeOpeningHours = (openingHours) =>
	openingHours.map((openingHour) => {
		return {
			days: openingHour.days.filter((d) => d.checked).map((d) => d.Value),
			from: timeToTimeSpan(openingHour.start),
			to: timeToTimeSpan(openingHour.end),
		};
	});
export const normalizeClosingDates = (closings) =>
	closings
		? closings.map((c) => {
				let data = {
					id: c.id,
					from: c.from,
					to: c.isInterval ? c.to : c.from,
					reason: c.reason,
				};

				// les ids locaux sont générés par le composant ClosingDates et ne servent qu'au front
				if (c.id.includes("local-")) delete data["id"];
				return data;
		  })
		: [];

export const denormalizeClosingDates = (closings) =>
	closings
		? closings.map((c) => ({
				...c,
				from: new Date(c.from),
				to: new Date(c.to),
				isInterval: c.to !== c.from,
				dirtyFrom: true,
				dirtyTo: c.to !== c.from,
		  }))
		: [];

export const removeKeys = (obj, keys) => {
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			switch (typeof obj[prop]) {
				case "object":
					if (keys.indexOf(prop) > -1) {
						delete obj[prop];
					} else {
						removeKeys(obj[prop], keys);
					}
					break;
				default:
					if (keys.indexOf(prop) > -1) {
						delete obj[prop];
					}
					break;
			}
		}
	}
};

export const encodeQuerySearchUrl = (address) => {
	return address ? encodeURI(`${address.latitude}+${address.longitude}`) : "";
};

export const encodeQuerySearchUrlAddress = (entity) => {
	let str = entity.name;
	if (entity.address) {
		str += `,${entity.address.line1},${entity.address.zipcode} ${entity.address.city},France`;
	}
	return str;
};

export const freezeBody = () => {
	const scroll = window.scrollY;
	const mainContent = document.getElementById("main-content");
	mainContent.style.position = "fixed";
	mainContent.classList.add("mobile-overflow-hidden");
	mainContent.style.top = `-${scroll - 64}px`;
};

export const unfreezeBody = () => {
	const mainContent = document.getElementById("main-content");

	if (!mainContent.classList.contains("mobile-overflow-hidden")) {
		return;
	}

	const scrollY = parseInt(mainContent.style.top.substring(0, mainContent.style.top.length - 2)) - 64 + "px";

	mainContent.style.position = "";
	mainContent.classList.remove("mobile-overflow-hidden");
	mainContent.style.top = "";
	window.scrollTo(0, parseInt(scrollY || "0") * -1);
};

export const formatMoney = (price) => `${price.toFixed(2).replace(".", ",")}€`;

export const isBio = (tags) => {
	if (typeof tags === "string") return tags.indexOf("bio") > -1;

	if (!tags || tags.length < 1) return false;

	return tags.map((t) => t.name.toLowerCase()).includes("bio");
};

export const formatConditioningDisplay = (conditioning, quantityPerUnit, unit) => {
	if (!conditioning || conditioning == ConditioningKind.NotSpecified.Value) {
		return "";
	}

	switch (conditioning) {
		case ConditioningKind.Bulk.Value:
			return `(${quantityPerUnit}${unit})`;
		case ConditioningKind.Box.Value:
			return `(Boîte de ${quantityPerUnit})`;
		case ConditioningKind.Bunch.Value:
			return `(1 botte)`;
		case ConditioningKind.Bouquet.Value:
			return `(1 bouquet)`;
		case ConditioningKind.Basket.Value:
			return `(${quantityPerUnit} personne${quantityPerUnit > 1 ? "s" : ""})`;
		case ConditioningKind.Piece.Value:
			return `(${quantityPerUnit} pièce${quantityPerUnit > 1 ? "s" : ""})`;
		default:
			return "";
	}
};

export function* getNextId() {
	let i = 0;

	while (true) {
		yield i++;
	}
}
