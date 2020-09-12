import { query, mutate } from "svelte-apollo";
import { from } from "apollo-boost";
import { createHttpLink } from "apollo-link-http";
import ApolloClient from "apollo-client";
import { setContext } from "apollo-link-context";
import { InMemoryCache } from "apollo-cache-inmemory";
import { setClient } from "svelte-apollo";
import gql from "graphql-tag";
import { removeKeys } from "../helpers/app";

let client = null;
let errorsHandler = null;

class SheaftGraphQL {
	constructor(apolloClient, errHandler) {
		client = apolloClient;
		errorsHandler = errHandler;
	}

	async query(request, variables, trackerUuid) {
		try {
			if (trackerUuid) errorsHandler.clearErrors(trackerUuid);

			var response = await query(client, {
				query: request,
				variables,
			}).result();

			var dataType = findDataType(request);
			var res = handleResults(response.data, dataType);
			if (!res.success) {
				errorsHandler.handleUuidErrors(res.errors, trackerUuid);
			}

			return res;
		} catch (ex) {
			var res = formatServerError(ex);
			errorsHandler.handleUuidErrors(res.errors, trackerUuid);
			return res;
		}
	}

	async mutate(request, input, trackerUuid, typename) {
		try {
			if (trackerUuid) errorsHandler.clearErrors(trackerUuid);
			// let typename = input["__typename"];
			// enlever toutes les occurences de typename dans l'objet en profondeur
			removeKeys(input, ["__typename"]);
			var response = await mutate(client, {
				mutation: request,
				variables: {
					input,
				},
			});

			var dataType = findDataType(request);
			var res = handleResults(response.data, dataType);

			if (!res.success) {
				errorsHandler.handleUuidErrors(res.errors, trackerUuid);
			} else {
				updateApolloCache(res, dataType, input, typename);
			}

			return res;
		} catch (ex) {
			var res = formatServerError(ex);
			errorsHandler.handleUuidErrors(res.errors, trackerUuid);
			return res;
		}
	}
}

function findIdInDataType(dataType) {
	var idFound = false;
	for (var i = 0; i < dataType.length; i++) {
		if (dataType[i] === "id") idFound = true;
		else if (Array.isArray(dataType[i]))
			idFound = findIdInDataType(dataType[i]);

		if (idFound) break;
	}
	return idFound;
}

function updateApolloCache(res, dataType, input, typename) {
	if (!res || !res.data) return;

	if (dataType.length > 1 && !findIdInDataType(dataType)) {
		throw "ID is mandatory to update the cache.";
	}

	var hasInputIds = input.id || input.ids;
	if (Array.isArray(res.data)) {
		for (var i = 0; i < res.data.length; i++) {
			handleApolloCache(res.data[i], hasInputIds, typename);
		}
	} else if (dataType.length > 1) {
		handleApolloCache(res.data, hasInputIds, typename);
	} else if (typeof res.data == "boolean" && input.id) {
		deleteItemInApolloCache(input.id, typename);
	} else if (typeof res.data == "boolean" && input.ids) {
		input.ids.forEach((id) => {
			deleteItemInApolloCache(id, typename);
		});
	}
}

function handleApolloCache(item, hasInputIds, typename) {
	if (item.id && hasInputIds) {
		return updateItemInApolloCache(item);
	}

	clearApolloCache(typename);
}

function clearApolloCache(typename) {
	if (!typename) return;

	var type = findDataType(typename)[0];
	if (!type) return;

	if (!client.cache.data.data.ROOT_QUERY) return;

	var cacheUpdated = false;
	var props = Object.getOwnPropertyNames(client.cache.data.data.ROOT_QUERY);
	for (var i = 0; i < props.length; i++) {
		if (props[i] == type || props[i].indexOf(type + "(") > -1) {
			var queries = Object.getOwnPropertyNames(client.cache.data.data);
			for (var j = 0; j < queries.length; j++) {
				if (queries[j].indexOf("$ROOT_QUERY." + props[i]) > -1) {
					client.cache.data.delete(queries[j]);
					cacheUpdated = true;
				}
			}
		}
	}

	if (cacheUpdated) client.resetStore();
}

function updateItemInApolloCache(item) {
	if (!item.__typename) {
		console.error("Cannot update apollo cache when typename is undefined.");
		return;
	}

	client.writeFragment({
		id: item.id,
		fragment: gql`
			fragment apolloFragment on ${item.__typename} {
				id
			}
		`,
		data: item,
	});
}

function addItemInApolloCache(item) {
	client.cache.customAdd(item);
}

function deleteItemInApolloCache(id, typename) {
	client.cache.data.delete(id);
	clearApolloCache(typename);
}

function findDataType(data) {
	return findRecursiveSelection(data.definitions[0].selectionSet.selections);
}

function findRecursiveSelection(selections) {
	var values = [];
	for (var i = 0; i < selections.length; i++) {
		if (!selections[i]) continue;

		values.push(selections[i].name.value);
		if (selections[i].selectionSet && selections[i].selectionSet.selections) {
			var items = findRecursiveSelection(selections[i].selectionSet.selections);
			if (items.length > 0) values.push(items);
		}
	}

	return values;
}

function handleResults(data, dataTypes) {
	var resultData = data[dataTypes[0]];
	if (!resultData && dataTypes.length > 1) {
		var selection = dataTypes[1].filter((dt) => dt == "nodes" || dt == "edges");
		if (selection.length == 0)
			return {
				data: null,
				errors: [
					{ code: "NOT_FOUND", message: "La ressource est introuvable" },
				],
				success: false,
			};
	}

	var errors = null;
	var success = true;

	if (typeof resultData === "boolean") {
		return {
			data: resultData,
			errors: null,
			success: success,
		};
	}

	if (resultData.nodes)
		return {
			data: resultData.nodes,
			pageInfo: resultData.pageInfo,
			totalCount: resultData.totalCount,
			errors,
			success,
		};

	if (resultData.edges)
		return {
			data: resultData.edges.map((n) => n.node),
			pageInfo: resultData.pageInfo,
			totalCount: resultData.totalCount,
			errors,
			success,
		};

	if (Array.isArray(resultData))
		return {
			data: resultData,
			pageInfo: {
				hasPreviousPage: false,
				hasNextPage: false,
				startCursor: null,
				endCursor: null,
			},
			totalCount: resultData.length,
			errors,
			success,
		};

	return {
		data: resultData,
		errors,
		success,
	};
}

function formatServerError(error) {
	var errors = [];
	if (error.toString() == "Error: Network error: Failed to fetch") {
		errors = [
			{
				code: "OFFLINE",
				message:
					"La connexion au serveur a été perdue, veuillez réitérer votre demande dès que la connexion sera rétablie",
			},
		];
	} else {
		errors = getErrors(error);
	}

	return {
		data: [],
		pageInfo: {
			hasPreviousPage: false,
			hasNextPage: false,
			startCursor: null,
			endCursor: null,
		},
		totalCount: 0,
		success: false,
		errors: errors,
	};
}

function getErrors(error) {
	if (error && error.graphQLErrors) {
		var errors = [];
		for (var i = 0; i < error.graphQLErrors.length; i++) {
			var graphQlError = error.graphQLErrors[i];
			var code = null;
			if (graphQlError.extensions && graphQlError.extensions.code) {
				code = graphQlError.extensions.code;
			}

			if (!code) code = "Unexpected";

			var message = null;

			if (
				graphQlError.extensions &&
				graphQlError.extensions.hasOwnProperty(code)
			) {
				message = graphQlError.extensions[code];
			}

			if (!message) {
				message =
					graphQlError.extensions && graphQlError.extensions.message
						? graphQlError.extensions.message
						: graphQlError.message;
			}

			errors.push({
				code,
				message,
			});
		}

		return errors;
	}

	return [
		{
			code: "Unexpected",
			message: "Une erreur inattendue est survenue !",
		},
	];
}

InMemoryCache.prototype.customAdd = (entry) => {
	this.data.data = {
		[entry.id]: entry,
	};
};

let graphQLInstance = null;

export function InitGraphQL(authInstance, url, errHandler) {
	const httpLink = createHttpLink({
		uri: url + "/graphql",
	});

	const authMiddleware = setContext((operation, { headers }) => {
		if (!authInstance.authenticated) {
			return {
				headers: {
					...headers,
				},
			};
		}

		return {
			headers: {
				...headers,
				Authorization: `Bearer ${authInstance.user.access_token}` || null,
			},
		};
	});

	const client = new ApolloClient({
		link: from([authMiddleware, httpLink]),
		cache: new InMemoryCache({
			addTypename: true,
			dataIdFromObject: (object) => object.id,
		}),
	});

	setClient(client);

	graphQLInstance = new SheaftGraphQL(client, errHandler);
	Object.freeze(graphQLInstance);
	return graphQLInstance;
}

export default function GetGraphQLInstance() {
	return graphQLInstance;
}
