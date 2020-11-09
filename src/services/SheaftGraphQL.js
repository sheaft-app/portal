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

			var dataType = this.findDataType(request);
			var res = this.handleResults(response.data, dataType);
			if (!res.success) {
				errorsHandler.handleUuidErrors(res.errors, trackerUuid);
			}

			return res;
		} catch (ex) {
			var res = this.formatServerError(ex);
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

			var dataType = this.findDataType(request);
			var res = this.handleResults(response.data, dataType);

			if (!res.success) {
				errorsHandler.handleUuidErrors(res.errors, trackerUuid);
			} else {
				this.updateApolloCache(res, dataType, input, typename);
			}

			return res;
		} catch (ex) {
			var res = this.formatServerError(ex);
			errorsHandler.handleUuidErrors(res.errors, trackerUuid);
			return res;
		}
	}

	findIdInDataType(dataType) {
		var idFound = false;
		for (var i = 0; i < dataType.length; i++) {
			if (dataType[i] === "id") idFound = true;
			else if (Array.isArray(dataType[i]))
				idFound = this.findIdInDataType(dataType[i]);

			if (idFound) break;
		}
		return idFound;
	}

	updateApolloCache(res, dataType, input, typename) {
		if (!res || !res.data || dataType.length < 2) return;

		if (dataType.length > 1 && !this.findIdInDataType(dataType)) {
			throw "ID is mandatory to update the cache.";
		}

		var hasInputIds = input.id || input.ids;
		if (Array.isArray(res.data)) {
			for (var i = 0; i < res.data.length; i++) {
				this.handleApolloCache(res.data[i], hasInputIds, typename);
			}
		} else if (dataType.length > 1) {
			this.handleApolloCache(res.data, hasInputIds, typename);
		} else if (typeof res.data == "boolean" && input.id) {
			this.deleteItemInApolloCache(input.id, typename);
		} else if (typeof res.data == "boolean" && input.ids) {
			input.ids.forEach((id) => {
				this.deleteItemInApolloCache(id, typename);
			});
		}
	}

	handleApolloCache(item, hasInputIds, typename) {
		if (item.id && hasInputIds) {
			return this.updateItemInApolloCache(item);
		}

		this.clearApolloCache(typename);
	}

	clearApolloCache(typename) {
		if (!typename) return;
		if (!client.cache.data.data.ROOT_QUERY) return;

		var cacheUpdated = false;
		const props = Object.getOwnPropertyNames(client.cache.data.data.ROOT_QUERY);
		const queries = Object.getOwnPropertyNames(client.cache.data.data);

		// on a passé un id, traitement spécifique
		if (typeof typename == "string") {
			const query = queries.find((q) => q == typename);
			if (query) {
				client.cache.data.delete(query);
				cacheUpdated = true;
			}
		} else {
			var type = this.findDataType(typename)[0];

			if (!type) return;

			for (var i = 0; i < props.length; i++) {
				if (props[i] == type || props[i].indexOf(type + "(") > -1) {
					for (var j = 0; j < queries.length; j++) {
						if (queries[j].indexOf("$ROOT_QUERY." + props[i]) > -1) {
							client.cache.data.delete(queries[j]);
							cacheUpdated = true;
						}
					}
				}
			}
		}

		if (cacheUpdated) client.resetStore();
	}

	updateItemInApolloCache(item) {
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

	deleteItemInApolloCache(id, typename) {
		client.cache.data.delete(id);
		this.clearApolloCache(typename);
	}

	findDataType(data) {
		return this.findRecursiveSelection(data.definitions[0].selectionSet.selections);
	}

	findRecursiveSelection(selections) {
		var values = [];
		for (var i = 0; i < selections.length; i++) {
			if (!selections[i]) continue;

			values.push(selections[i].name.value);
			if (selections[i].selectionSet && selections[i].selectionSet.selections) {
				var items = this.findRecursiveSelection(
					selections[i].selectionSet.selections
				);
				if (items.length > 0) values.push(items);
			}
		}

		return values;
	}

	handleResults(data, dataTypes) {
		var resultData = data[dataTypes[0]];
		if (!resultData && dataTypes.length > 1) {
			var selection = dataTypes[1].filter(
				(dt) => dt == "nodes" || dt == "edges"
			);
			if (selection.length == 0)
				return {
					data: null,
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

	formatServerError(error) {
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
			errors = this.getErrors(error);
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

	getErrors(error) {
		if (error && error.graphQLErrors) {
			var errors = [];
			for (var i = 0; i < error.graphQLErrors.length; i++) {
				var graphQlError = error.graphQLErrors[i];
				var code = null;
				var identifier = null;

				if (graphQlError.extensions && graphQlError.extensions.code) {
					code = graphQlError.extensions.code;
					identifier = graphQlError.extensions.RequestIdentifier;
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
					message = graphQlError.message;
				}

				errors.push({
					code,
					message,
					identifier,
					error
				});
			}

			return errors;
		}

		return [
			{
				code: "Unexpected",
				message: "Une erreur inattendue est survenue !",
				error : error
			},
		];
	}
}

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
