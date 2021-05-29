import {writable} from "svelte/store";
import {GET_CART, GET_MOST_RECENT_CART} from "./queries";
import {CREATE_CONSUMER_ORDER, UPDATE_CONSUMER_ORDER} from "./mutations.js";
import orderBy from "lodash/orderBy";

export const card = writable({
    data: {
        cardName: null,
        cardNumber: null,
        cardExpirationDate: null,
        cardCvx: null,
        cardType: "CB_VISA_MASTERCARD",
    },
    year: null,
    month: null
});

const store = () => {
	let context = null;
	let errorsHandler = null;
	let initialized = false;

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
		warningInfo: null
	}

	const {subscribe, set, update} = writable(state);

	const methods = {
		async initialize(c, errorsHandlerInstance, authenticated = false) {
			if(initialized) return;

			let selectedCart = null;

			context = c;
			console.log(context);
			errorsHandler = errorsHandlerInstance;

			let currentOrder = null;

			try {
				currentOrder = JSON.parse(localStorage.getItem("user_current_order"));
			} catch (e) {
				currentOrder = null;
			}

			if (authenticated) {
				await context.query({
					query: GET_MOST_RECENT_CART,
					errorsHandler,
					success: (res) => selectedCart = res,
					errorNotification: "Impossible de récupérer les informations du panier le plus récent"
				});
			}

			if (currentOrder && (!selectedCart || currentOrder !== selectedCart.id)) {
				await context.query({
					query: GET_CART,
					variables: { input: currentOrder },
					errorsHandler,
					success: (res) => {
						if (!res || !res.data || ["SUCCEEDED", "WAITING", "VALIDATED"].includes(res.data.status))
							return this.clearStorage();
						else if (selectedCart)
							return update(state => {
								state.conflicts = [
									selectedCart,
									res.data
								];
								state.isInitializing = false;
								return state;
							});
						else
							selectedCart = res.data;
					},
					error: () => {
						this.clearStorage();
					},
					errorNotification: "Imposible de récupérer les informations du panier"
				})
			}

			if (selectedCart) {
				setters.updateWholeCart(selectedCart);
			} else if (JSON.parse(localStorage.getItem("user_cart"))) {
				// on a des infos dans le storage mais le cart n'a pas été créé dans la DB
				await this.updateCart();
			}

			update(state => {
				state.isInitializing = false;
				return state;
			});

			initialized = true;
		},
		async updateCart(donation = "NONE") {
			update(state => {
				state.warningInfo = null;
				return state;
			});

			if (state.isSaving) {
				return;
			}

			state.isSaving = true;
			const orderMutation = state.userCurrentOrder ? UPDATE_CONSUMER_ORDER : CREATE_CONSUMER_ORDER;
			const variables = {
				id: state.userCurrentOrder,
				donation,
				products: getters.getNormalizedProducts(),
				deliveries: getters.getNormalizedSelectedDeliveries()
			};

			if (!state.userCurrentOrder) {
				delete variables["id"];
			}

			const res = await context.mutate({
				mutation: orderMutation,
				variables,
				errorsHandler,
				success: (res) => {
					console.log("success");
					setters.updateWholeCart(res);
				},
				errorNotification: "Impossible de mettre à jour votre panier",
				error: (response) => {
					const invalidProductsError = response.errors.find((e) => e.message.includes('produits sont invalides'));

					if (invalidProductsError) {
						const ids = [...invalidProductsError.message.matchAll(/[0-9a-fA-F]{32}/gm)].map((i) => i[0]);
						let products = JSON.parse(localStorage.getItem("user_cart"));
						localStorage.setItem('user_cart', JSON.stringify(products.filter((p) => !ids.includes(p.id))));
						setters.disableProducts(ids);
					}

					const disabledProductsError = response.errors.find((e) => e.message.includes('sont actuellement indisponibles'));

					if (disabledProductsError) {
						const ids = [...disabledProductsError.message.matchAll(/[0-9a-fA-F]{32}/gm)].map((i) => i[0]);
						let products = JSON.parse(localStorage.getItem("user_cart"));
						localStorage.setItem('user_cart', JSON.stringify(products.filter((p) => !ids.includes(p.id))));
						setters.disableProducts(ids);
					}

					if (invalidProductsError || disabledProductsError) {
						update(state => {
							state.warningInfo = "Désolé, ce produit est temporairement indisponible.";
							return state;
						});
					}

					return update(state => {
						state.isSaving = false;
						return state;
					});
				}
			});

			return res.status && ["CREATED", "UPDATED"].includes(res.status);
		},
		async chooseCart(cartId) {
			state.isSaving = true;
			await context.query({
				query: GET_CART,
				variables: { input: cartId },
				errorsHandler,
				success: (res) => setters.updateWholeCart(res.data),
				errorNotification: "Impossible de choisir le panier"
			});
		},
		addProduct(productId, quantity) {
			localStorage.setItem("user_cart", JSON.stringify([...getters.getValidProducts().map((i) => ({
				id: i.id,
				quantity: i.quantity
			})), {
				id: productId,
				quantity
			}]));
		},
		updateCartInStorage() {
			localStorage.setItem("user_cart", JSON.stringify(getters.getValidProducts().map((i) => ({
				id: i.id,
				quantity: i.quantity
			}))));
		},
		clearStorage() {
			localStorage.removeItem("user_last_transaction");
			localStorage.removeItem("user_current_order");
			localStorage.removeItem("user_cart");
		},
		normalizeDeliveries(deliveries) {
			return deliveries.map((delivery, index) => ({
				number: index + 1,
				delivery: {
					id: delivery.deliveryMode.id,
					address: delivery.deliveryMode.address,
					kind: delivery.deliveryMode.kind
				},
				deliveryHour: {
					...delivery.expectedDelivery
				},
				producerId: delivery.deliveryMode.producer.id,
				producerName: delivery.deliveryMode.producer.name,
			}));
		}
	};

	const getters = {
		getProductById(productId) {
			return state.products.find((i) => i.id == productId);
		},
		getSortedProductsByProducerName() {
			return orderBy(state.products, i => i.producer.name, ['asc']);
		},
		getProducersIds() {
			return state.products
				.map(p => p.producer.id)
				.reduce(
					(unique, item) =>
						unique.includes(item) ? unique : [...unique, item],
					[]
				);
		},
		getProductsMappedByProducer() {
			return state.products.reduce((producers, product) => {
				let producer = producers.find(p => p.id == product.producer.id);

				producer
					? producer.nbProducts += product.quantity
					: producers = [
						...producers,
						{
							...product.producer,
							nbProducts: product.quantity
						}
					];

				return producers;
			}, []);
		},
		getValidProducts() {
			return state.products.filter(p => p.quantity > 0 && !p.disabled && !p.producer.disabled);
		},
		getDeliveryByProducerId(_producerId) {
			return state.selectedDeliveries.find((d) => d.producerId == _producerId);
		},
		getHasSelectedDeliveryForEveryProducer() {
			return state.selectedDeliveries.length == this.getProducersIds().length;
		},
		getNormalizedProducts() {
			let products = JSON.parse(localStorage.getItem("user_cart"));

			return products.map(product => ({
				id: product.id,
				quantity: product.quantity
			}));
		},
		getNormalizedSelectedDeliveries() {
			state.selectedDeliveries.map((d) => {
				let hasProducerInCart = state.products.find((i) => i.producer.id == d.producerId);

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
					expectedDeliveryDate: d.deliveryHour ? d.deliveryHour.expectedDeliveryDate : null
				}))
				.filter((producer, index, self) =>
					index === self.findIndex(t => t.producerId === producer.producerId)
				);
		},
		getSelectedDelivery(deliveries) {
			for (const delivery of deliveries) {
				let _delivery = state.selectedDeliveries.find((p) => p.delivery.id == delivery.id);
				if (_delivery) return _delivery;
			}

			return null;
		}
	}

	const setters = {
		setProducts(products) {
			update(state => {
				state.products = products;
				methods.updateCartInStorage();
				return state;
			})
		},
		disableProducts(productIds) {
			productIds.map((i) => {
				let product = getters.getProductById(i);
				if (product) product.disabled = true;
			})
		},
		disableProducers(producersIds) {
			producersIds.map((i) => {
				state.products.map((c) => {
					if (c.producer.id == i) {
						return {
							...c,
							producer: {
								...c.producer,
								disabled: true
							}
						}
					} else return c;
				});
			})
		},
		removeProduct(productId) {
			update(state => {
				state.products = state.products.filter(c => c.id !== productId);
				methods.updateCartInStorage();
				methods.updateCart();
				return state;
			})
		},
		async updateProduct(productId, quantity) {
			update(state => {
				let product = getters.getProductById(productId);

				if (!product) {
					methods.addProduct(productId, quantity);
				} else {
					product.quantity = quantity;
					methods.updateCartInStorage();
				}
				return state;
			})
			const result = await methods.updateCart();
			return result;
		},
		removeProducerProducts(producerId) {
			update(state => {
				state.products = state.products.filter(c => c.producer.id !== producerId);
				resetSelectedDeliveryForProducerId(producerId);
				methods.updateCartInStorage();
				methods.updateCart();
				return state;
			})
		},
		reset() {
			update(state => {
				state.products = [];
				methods.updateCartInStorage();
				localStorage.removeItem("user_last_transaction");
				localStorage.removeItem("user_current_order");
				return state;
			})
		},
		updateDelivery({producerId, delivery, deliveryHour}) {
			update(state => {
				let deliveryMode = getters.getDeliveryByProducerId(producerId);

				if (deliveryMode) {
					deliveryMode.delivery = delivery;
					deliveryMode.deliveryHour = deliveryHour;
					state.selectedDeliveries = state.selectedDeliveries;
				} else {
					state.selectedDeliveries = [...state.selectedDeliveries, {
						number: state.selectedDeliveries.length + 1,
						producerId,
						delivery,
						deliveryHour
					}];
				}

				methods.updateCart();
				return state;
			})
		},
		setSelectedDeliveries(deliveries) {
			update(state => {
				state.selectedDeliveries = deliveries;
				return state;
			});
		},
		resetSelectedDeliveryForProducerId(producerId) {
			update(state => {
				state.selectedDeliveries = state.selectedDeliveries.filter((d) => d.producerId !== producerId);
				return state;
			})
		},
		updateWholeCart(selectedCart) {
			localStorage.setItem("user_current_order", JSON.stringify(selectedCart.id));
			update(state => {
				state.products = selectedCart.products;
				state.totalFees = selectedCart.totalFees;
				state.donation = selectedCart.donation;
				state.productsCount = selectedCart.productsCount;
				state.totalOnSalePrice = selectedCart.totalOnSalePrice;
				state.totalPrice = selectedCart.totalPrice;
				state.totalReturnableOnSalePrice = selectedCart.totalReturnableOnSalePrice;
				state.returnablesCount = selectedCart.returnablesCount;
				state.userCurrentOrder = selectedCart.id;
				state.conflicts = [];

				if (selectedCart.deliveries && selectedCart.deliveries.length > 0) {
					setters.setSelectedDeliveries(methods.normalizeDeliveries(selectedCart.deliveries));
				}

				state.isSaving = false;

				return state;
			});
			methods.updateCartInStorage();
		}
	};

	return {
		subscribe,
		set,
		update,
		...methods,
		...getters,
		...setters
	}
}

export default store()
