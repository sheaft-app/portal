import { get } from "svelte/store";
import { filters } from "./store";

const defaultSearchValues = {
	text: null,
	tags: [],
	sort: "producer_geolocation asc",
	maxDistance: null,
};

export const normalizeSearchProducers = (values, page = 1) => {
	let tags = [];

	if (Object.keys(values).length == 0) {
		values = defaultSearchValues;
	}

	if (!values["sort"]) {
		values["sort"] = defaultSearchValues.sort;
	}

	if (values["maxDistance"]) {
		values["maxDistance"] = parseInt(values["maxDistance"]);
	}

	if (values["category"]) {
		values["category"] = values["category"];
		tags = [...tags, values["category"]];
	}

	if (values["labels"]) {
		values["labels"] = values["labels"].split(",");
		tags = [...tags, ...values["labels"]];
	}

	filters.set({
		...values,
		tags,
	});

	return {
		input: {
			text: get(filters).text,
			tags: get(filters).tags,
			sort: get(filters).sort,
			maxDistance: get(filters).maxDistance,
			page: page,
			take: 20,
		},
	};
};
