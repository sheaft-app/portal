import { get } from "svelte/store";
import { filters } from "./store";

const defaultSearchValues = {
    text: null,
    tags: [],
    sort: "producer_geolocation asc",
    latitude: null,
    longitude: null,
    maxDistance: null,
    producerId: null,
};

export const QUERY_SIZE = 25;

export const retrieveUserLocationInStorage = () => {
    var position = localStorage.getItem("user_location");
    if (position) {
        var parsed = JSON.parse(position);
        if (parsed.hasOwnProperty("latitude")) return parsed;

        return null;
    }

    return null;
};

export const retrieveUserLocationInQueryString = (values) => {
    if (!values || !values["latitude"] || !values["longitude"]) return null;

    return {
        latitude: parseFloat(values["latitude"]),
        longitude: parseFloat(values["longitude"]),
    };
};

export const updateUserLocationInQueryString = (position, routerInstance) => {
    if (!position) return false;

    routerInstance.replaceQueryParams(position);
    return true;
};

export const normalizeSearchProducts = (values, page = 1) => {
    let tags = [];

    if (Object.keys(values).length == 0) {
        values = defaultSearchValues;
    }

    if (!values["sort"]) {
        values["sort"] = defaultSearchValues.sort;
    }

    if (values["producerId"] && values["producerId"] <= 0) {
        values["producerId"] = null;
        producer = null;
    }

    if (values["maxDistance"] && values["maxDistance"].length > 0) {
        values["maxDistance"] = parseInt(values["maxDistance"]);
    }

    if (values["category"] && values["category"].length > 0) {
        values["category"] = values["category"];
        tags = [...tags, values["category"]];
    }

    if (values["labels"] && values["labels"].length > 0) {
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
            latitude: Number(get(filters).latitude),
            longitude: Number(get(filters).longitude),
            maxDistance: get(filters).maxDistance,
            page: page,
            take: QUERY_SIZE,
            producerId: get(filters).producerId,
        },
    };
};