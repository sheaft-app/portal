import { querystring, push, pop, replace, location as locat } from "svelte-spa-router";

import qs from "qs";

import Guid from "../helpers/Guid";

class SheaftRouter {
	constructor() {
		this.locSubscription = locat.subscribe((loc) => {
			this.currentUrl = loc;
		});

		this.queryStrSubscription = querystring.subscribe((qs) => {
			this.currentQueryString = qs;
		});
	}

	async goTo(route, routeParams, skipCache) {
		let url = handleUrl(route, routeParams, skipCache);
		await push(url);
	}

	async replacePage(route, routeParams, skipCache) {
		let url = handleUrl(route, routeParams, skipCache);
		await replace(url);
	}

	async goBack() {
		await pop();
	}

	refresh() {
		let params = this.getQueryParams();
		params["refresh"] = Guid.NewGuid();
		this.replaceQueryParams(params);
	}

	shouldSkipCache() {
		return getParams(this.currentQueryString)["refresh"] != null;
	}

	replaceQueryParams(params) {
		return handleParams(replace, this.currentQueryString, params, this.currentUrl);
	}

	pushQueryParams(params) {
		return handleParams(push, this.currentQueryString, params, this.currentUrl);
	}

	getQueryStringParams(params) {
		let qsParams = getParams();
		return Object.keys(params).map((p) => (params[p] = qsParams[p]));
	}

	getQueryParams() {
		return getParams(this.currentQueryString);
	}

	getQueryParam(paramName) {
		return getParams(this.currentQueryString)[paramName];
	}

	unregister() {
		if (this.locSubscription) this.locSubscription();
		if (this.queryStrSubscription) this.queryStrSubscription();
	}
}

function handleUrl(route, routeParams, skipCache) {
	let isObject = typeof route === "object";
	let url = isObject ? route.Path : route;

	let params = null;
	if (isObject && skipCache) {
		if (route.Params && route.Params.Query) route.Params.Query.refresh = Guid.NewGuid();
		else if (route.Params) route.Params.Query = { refresh: Guid.NewGuid() };
		else route.Params = { Query: { refresh: Guid.NewGuid() } };
	} else if (skipCache) {
		params = { Query: { refresh: Guid.NewGuid() } };
	}

	url = handleRoutesParams(url, routeParams, isObject ? route.Params : params);
	if (url == null) url = "/";

	return url;
}

function handleRoutesParams(url, routeParams, defaultRouteParams) {
	url = sanitizeUrl(url);
	if (!defaultRouteParams) return url;

	let queryParams = [];
	Object.keys(defaultRouteParams).forEach((paramKey) => {
		let defaultRouteParam = defaultRouteParams[paramKey];
		let routeParam = routeParams ? routeParams[paramKey] : null;

		if (paramKey.toLowerCase() !== "query") {
			let param = routeParam ? routeParam : defaultRouteParam;
			if (param == null) throw `Invalid ${paramKey} parameter for route: ${url}`;
			url = url.replace(`:${paramKey}`, param);
			``;
			return;
		}

		Object.keys(defaultRouteParam).forEach((queryKey) => {
			let defaultQueryParam = defaultRouteParam[queryKey];
			let queryParam = routeParam ? routeParam[queryKey] : null;
			let param = queryParam ? queryParam : defaultQueryParam;

			if (param != null && Array.isArray(param)) {
				param.forEach((p) => {
					queryParams = [
						...queryParams,
						{
							key: queryKey,
							value: p,
						},
					];
				});
			} else if (param != null) {
				queryParams = [
					...queryParams,
					{
						key: queryKey,
						value: param,
					},
				];
			}
		});
	});

	if (queryParams.length > 0) {
		if (url.indexOf("?") < 0) url += "?";

		queryParams.forEach((qp) => {
			url += `&${qp.key}=${qp.value}`;
		});
	}

	return url;
}

function sanitizeUrl(url) {
	if (!url) throw "url to navigate to cannot be null";

	if (url.indexOf("/#/") === 0) url = url.substr(2);

	if (url.indexOf("#/") === 0) url = url.substr(1);

	return url;
}

function handleParams(method, query, params, currentUrl) {
	let newParams = createOrUpdateQueryStringParams(query, params);
	let searchString = formatObjectAsQueryString(newParams);
	if (searchString && searchString.length > 0) {
		method(`${currentUrl}?&${searchString}`);
		return newParams;
	}

	method(`${currentUrl}`);
	return newParams;
}

function getParams(queryString) {
	return qs.parse(queryString);
}

function formatObjectAsQueryString(searchValues) {
	return Object.keys(searchValues)
		.map((queryKey) => queryKey + "=" + searchValues[queryKey])
		.join("&");
}

function createOrUpdateQueryStringParams(queryString, newParams) {
	let params = getParams(queryString);

	params = {
		...params,
		...newParams,
	};

	return removeEmptyParams(params);
}

function removeEmptyParams(params) {
	return Object.keys(params).reduce((object, queryKey) => {
		if (!Array.isArray(params[queryKey]) && params[queryKey] != null)
			params[queryKey] = params[queryKey].toString();

		if (params[queryKey] && params[queryKey].length > 0) {
			object[queryKey] = params[queryKey];
		}
		return object;
	}, {});
}

export function InitRouter() {
	routerInstance = new SheaftRouter();
	return routerInstance;
}

let routerInstance = null;

export default function GetRouterInstance() {
	return routerInstance;
}
