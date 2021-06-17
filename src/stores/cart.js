import { writable } from "svelte/store";
import { GET_CART, GET_MOST_RECENT_CART } from "./queries";
import { CREATE_CONSUMER_ORDER, UPDATE_CONSUMER_ORDER } from "./mutations.js";
import orderBy from "lodash/orderBy";
import OrderStatusKind from "../enums/OrderStatusKind";

export const card = writable({
	data: {
		cardName: null,
		cardNumber: null,
		cardExpirationDate: null,
		cardCvx: null,
		cardType: "CB_VISA_MASTERCARD",
	},
	year: null,
	month: null,
});

const store = () => {
	let context = null;
	let errorsHandler = null;

	const state = {
		isInitializing: true,
		isSaving: false,
		products: [],
		selectedDeliveries: [],
		userCurrentOrder: null,
		totalFees: 0,
		donation: 0,
		productsCount: 0,
		totalOnSalePrice: 0,
		totalPrice: 0,
		totalReturnableOnSalePrice: 0,
		returnablesCount: 0,
		conflicts: [],
		warningInfo: null,
		status: null,
	};

	const { subscribe, set, update } = writable(state);

	const methods = {
		async initialize(c, errorsHandlerInstance, authenticated = false) {
			let currentOrder = null;

			context = c;
			errorsHandler = errorsHandlerInstance;

			this.clearState();

			let currentOrderId = null;
			try {
				currentOrderId = JSON.parse(localStorage.getItem("user_currentOrderId"));
				if (currentOrderId && currentOrderId.length > 0)
					await context.query({
						query: GET_CART,
						variables: { input: currentOrderId },
						errorsHandler,
						success: (res) => {
							if (!res || ![OrderStatusKind.Created.Value, OrderStatusKind.Waiting.Value].includes(res.status))
								this.clearStorage();
							else {
								currentOrder = res;
							}
						},
						error: () => {
							this.clearStorage();
						},
						errorNotification: "Impossible de récupérer les informations du panier",
					});
			} catch (e) {
				currentOrderId = null;
				currentOrder = null;
			}

			if (authenticated) {
				await context.query({
					query: GET_MOST_RECENT_CART,
					errorsHandler,
					success: (res) => {
						if (!res) return;

						if (currentOrder && res.id !== currentOrder.id)
							update((state) => {
								state.conflicts = [currentOrder, res];
								return state;
							});
						else {
							currentOrder = res;
						}
					},
					errorNotification: "Impossible de récupérer les informations du panier le plus récent",
				});
			}

			if (currentOrder && (!state.conflicts || state.conflicts.length < 1)) setters.updateWholeCart(currentOrder);

			update((state) => {
				state.isInitializing = false;
				return state;
			});
		},
		async updateCart(donation = "NONE") {
			update((state) => {
				state.warningInfo = null;
				return state;
			});

			if (state.isSaving) {
				return;
			}

			update((state) => {
				state.isSaving = true;
				return state;
			});

			const orderMutation = state.userCurrentOrder ? UPDATE_CONSUMER_ORDER : CREATE_CONSUMER_ORDER;
			const variables = {
				id: state.userCurrentOrder,
				donation,
				products: getters.getNormalizedProducts(),
				deliveries: getters.getNormalizedSelectedDeliveries(),
			};

			if (!state.userCurrentOrder) {
				delete variables["id"];
			}

			const res = await context.mutate({
				mutation: orderMutation,
				variables,
				errorsHandler,
				success: (res) => {
					setters.updateWholeCart(res);
				},
				errorNotification: "Impossible de mettre à jour votre panier",
				error: (response) => {
					const invalidProductsError = response.errors.find((e) => e.message.includes("produits sont invalides"));

					if (invalidProductsError) {
						const ids = [...invalidProductsError.message.matchAll(/[0-9a-fA-F]{32}/gm)].map((i) => i[0]);
						setters.disableProducts(ids);
					}

					const disabledProductsError = response.errors.find((e) =>
						e.message.includes("sont actuellement indisponibles")
					);

					if (disabledProductsError) {
						const ids = [...disabledProductsError.message.matchAll(/[0-9a-fA-F]{32}/gm)].map((i) => i[0]);
						setters.disableProducts(ids);
					}

					if (invalidProductsError || disabledProductsError) {
						update((state) => {
							state.warningInfo = "Désolé, ce produit est temporairement indisponible.";
							return state;
						});
					}

					return update((state) => {
						state.isSaving = false;
						return state;
					});
				},
			});

			return res.status && ["CREATED"].includes(res.status);
		},
		async chooseCart(cartId) {
			update((state) => {
				state.isSaving = true;
				return state;
			});

			await context.query({
				query: GET_CART,
				variables: { input: cartId },
				errorsHandler,
				success: (res) => setters.updateWholeCart(res),
				errorNotification: "Impossible de choisir le panier",
			});

			await methods.updateCart();
		},
		clearStorage() {
			localStorage.removeItem("user_last_transaction");
			localStorage.removeItem("user_currentOrderId");
			localStorage.removeItem("user_cart");
		},
		normalizeDeliveries(deliveries) {
			return deliveries.map((delivery, index) => ({
				number: index + 1,
				delivery: {
					id: delivery.deliveryMode.id,
					address: delivery.deliveryMode.address,
					kind: delivery.deliveryMode.kind,
				},
				deliveryHour: {
					...delivery.expectedDelivery,
				},
				producerId: delivery.deliveryMode.producer.id,
				producerName: delivery.deliveryMode.producer.name,
			}));
		},
	};

	const getters = {
		getProductById(productId) {
			return state.products.find((i) => i.id === productId);
		},
		getSortedProductsByProducerName() {
			return orderBy(state.products, (i) => i.producer.name, ["asc"]);
		},
		getProducersIds() {
			return state.products
				.filter((p) => p.producer)
				.map((p) => p.producer.id)
				.reduce((unique, item) => (unique.includes(item) ? unique : [...unique, item]), []);
		},
		getProductsMappedByProducer() {
			return state.products
				.filter((p) => p.producer)
				.reduce((producers, product) => {
					let producer = producers.find((p) => p.id === product.producer.id);

					producer
						? (producer.nbProducts += product.quantity)
						: (producers = [
								...producers,
								{
									...product.producer,
									nbProducts: product.quantity,
								},
						  ]);

					return producers;
				}, []);
		},
		getValidProducts() {
			return state.products.filter((p) => p.quantity > 0 && !p.disabled && !p.producer.disabled);
		},
		getDeliveryByProducerId(_producerId) {
			return state.selectedDeliveries.find((d) => d.producerId === _producerId);
		},
		getHasSelectedDeliveryForEveryProducer() {
			return state.selectedDeliveries.length === this.getProducersIds().length;
		},
		getNormalizedProducts() {
			return state.products.map((product) => ({
				id: product.id,
				quantity: product.quantity,
			}));
		},
		getNormalizedSelectedDeliveries() {
			state.selectedDeliveries.map((d) => {
				let hasProducerInCart = state.products.filter((p) => p.producer).find((i) => i.producer.id === d.producerId);

				if (!hasProducerInCart) {
					setters.resetSelectedDeliveryForProducerId(d.producerId);
				}
			});

			if (!this.getHasSelectedDeliveryForEveryProducer()) {
				return null;
			}

			return state.selectedDeliveries
				.map((d) => ({
					producerId: d.producerId,
					deliveryModeId: d.delivery ? d.delivery.id : null,
					expectedDeliveryDate: d.deliveryHour ? d.deliveryHour.expectedDeliveryDate : null,
				}))
				.filter((producer, index, self) => index === self.findIndex((t) => t.producerId === producer.producerId));
		},
		getSelectedDelivery(deliveries) {
			for (const delivery of deliveries) {
				let _delivery = state.selectedDeliveries.find((p) => p.delivery.id === delivery.id);
				if (_delivery) return _delivery;
			}

			return null;
		},
	};

	const setters = {
		setProducts(products) {
			update((state) => {
				state.products = products;
				return state;
			});
		},
		disableProducts(productIds) {
			productIds.map((i) => {
				let product = getters.getProductById(i);
				if (product) product.disabled = true;
			});
		},
		disableProducers(producersIds) {
			producersIds.map((id) => {
				state.products.map((c) => {
					if (c.producer.id === id) {
						return {
							...c,
							producer: {
								...c.producer,
								disabled: true,
							},
						};
					} else return c;
				});
			});
		},
		async removeProduct(productId) {
			update((state) => {
				state.products = state.products.filter((c) => c.id !== productId);
				return state;
			});

			await methods.updateCart();
		},
		async updateProduct(productId, quantity) {
			update((state) => {
				let product = getters.getProductById(productId);
				if (!product) {
					state.products = [...state.products, { id: productId, quantity }];
				} else {
					product.quantity = quantity;
				}
				return state;
			});

			await methods.updateCart();
		},
		async removeProducerProducts(producerId) {
			methods.resetSelectedDeliveryForProducerId(producerId);

			update((state) => {
				state.products = state.products.filter((c) => !c.producer || c.producer.id !== producerId);
				return state;
			});

			return await methods.updateCart();
		},
		reset() {
			methods.clearStorage();
			this.clearState();
		},
		clearState() {
			update((state) => {
				state.isInitializing = false;
				state.isSaving = false;
				state.products = [];
				state.selectedDeliveries = [];
				state.userCurrentOrder = null;
				state.totalFees = 0;
				state.donation = 0;
				state.productsCount = 0;
				state.totalOnSalePrice = 0;
				state.totalPrice = 0;
				state.totalReturnableOnSalePrice = 0;
				state.returnablesCount = 0;
				state.conflicts = [];
				state.warningInfo = null;
				state.status = null;

				return state;
			});
		},
		async updateDelivery({ producerId, delivery, deliveryHour }) {
			update((state) => {
				let deliveryMode = getters.getDeliveryByProducerId(producerId);

				if (deliveryMode) {
					deliveryMode.delivery = delivery;
					deliveryMode.deliveryHour = deliveryHour;
					state.selectedDeliveries = state.selectedDeliveries;
				} else {
					state.selectedDeliveries = [
						...state.selectedDeliveries,
						{
							number: state.selectedDeliveries.length + 1,
							producerId,
							delivery,
							deliveryHour,
						},
					];
				}

				return state;
			});

			await methods.updateCart();
		},
		setSelectedDeliveries(deliveries) {
			update((state) => {
				state.selectedDeliveries = deliveries;
				return state;
			});
		},
		resetSelectedDeliveryForProducerId(producerId) {
			update((state) => {
				state.selectedDeliveries = state.selectedDeliveries.filter((d) => d.producerId !== producerId);
				return state;
			});
		},
		updateWholeCart(order) {
			localStorage.setItem("user_currentOrderId", JSON.stringify(order.id));
			update((state) => {
				state.products = order.products;
				state.totalFees = order.totalFees;
				state.donation = order.donation;
				state.productsCount = order.productsCount;
				state.totalOnSalePrice = order.totalOnSalePrice;
				state.totalPrice = order.totalPrice;
				state.totalReturnableOnSalePrice = order.totalReturnableOnSalePrice;
				state.returnablesCount = order.returnablesCount;
				state.userCurrentOrder = order.id;
				state.status = order.status;
				state.conflicts = [];

				if (order.deliveries && order.deliveries.length > 0) {
					setters.setSelectedDeliveries(methods.normalizeDeliveries(order.deliveries));
				}

				state.isSaving = false;
				return state;
			});
		},
	};

	return {
		subscribe,
		set,
		update,
		...methods,
		...getters,
		...setters,
	};
};

export default store();
