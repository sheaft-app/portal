import { writable } from "svelte/store";
import { GET_CART } from "./queries";
import { CREATE_CONSUMER_ORDER, UPDATE_CONSUMER_ORDER } from "./mutations.js";
import orderBy from "lodash/orderBy";

const store = () => {
    let graphQLInstance = null;
    let errorsHandler = null;

    const state = {
        isInitializing: true,
        isSaving: false,
        items: [],
        selectedDeliveries: [],
        userCurrentOrder: null,
        totalFees: 0,
        donation: 0,
        productsCount: 0,
        totalOnSalePrice: 0,
        totalPrice: 0,
        totalReturnableOnSalePrice: 0,
        returnablesCount: 0
    }
    
    const { subscribe, set, update } = writable(state);

    const methods = {
        async initialize(apiInstance, errorsHandlerInstance) {
            graphQLInstance = apiInstance;
            errorsHandler = errorsHandlerInstance;

            const currentOrder = JSON.parse(localStorage.getItem("user_current_order"));
            const currentCart = JSON.parse(localStorage.getItem("user_cart"));
            
            if (currentOrder) {
                const res = await graphQLInstance.query(GET_CART, { input: currentOrder });

                if (!res.success || res.data == null || res.data.status == "SUCCEEDED" || res.data.status == "WAITING") {
                    this.clearStorage();
                    return;
                }
                
                update(state => { 
                    state.items = res.data.products;
                    state.totalFees = res.data.totalFees;
                    state.donation = res.data.donation;
                    state.productsCount = res.data.productsCount;
                    state.totalOnSalePrice = res.data.totalOnSalePrice;
                    state.totalPrice = res.data.totalPrice;
                    state.totalReturnableOnSalePrice = res.data.totalReturnableOnSalePrice;
                    state.returnablesCount = res.data.returnablesCount;
                    state.userCurrentOrder = currentOrder;
                    if (res.data.deliveries.length > 0) {
                        setters.setSelectedDeliveries(this.normalizeDeliveries(res.data.deliveries));
                    }
                    return state;
                });
            } else if (currentCart) {
                this.updateCart();
            }

            update(state => {
                state.isInitializing = false;
                return state;
            });
        },
        async updateCart(choosenDonation = "NONE") {
            if (state.isSaving) {
                return;
            }

            state.isSaving = true;
            const orderMutation = state.userCurrentOrder ? UPDATE_CONSUMER_ORDER : CREATE_CONSUMER_ORDER;
            const variables = {
                id: state.userCurrentOrder,
                donation: choosenDonation,
                products: getters.getNormalizedProducts(),
                producersExpectedDeliveries: getters.getNormalizedSelectedDeliveries()
            };

            if (!state.userCurrentOrder) {
                delete variables["id"];
            }

            let response = await graphQLInstance.mutate(orderMutation, variables);

            if (!response.success) {
                const errors = errorsHandler.getErrors();
                const invalidProductsError = errors.find((e) => e.message.includes('produits sont invalides'));

                if (invalidProductsError) {
                    const ids = [...invalidProductsError.message.matchAll(/[0-9a-fA-F]{32}/gm)].map((i) => i[0]);
                    setters.disableItems(ids);
                }   

                state.isSaving = false;
                return state;
            }

            state.userCurrentOrder = response.data.id;
            localStorage.setItem("user_current_order", JSON.stringify(response.data.id));

            setters.setItems(response.data.products);

            state.totalFees = response.data.totalFees;
            state.donation = response.data.donation;
            state.productsCount = response.data.productsCount;
            state.totalOnSalePrice = response.data.totalOnSalePrice;
            state.totalPrice = response.data.totalPrice;
            state.totalReturnableOnSalePrice = response.data.totalReturnableOnSalePrice;
            state.returnablesCount = response.data.returnablesCount;

            if (response.data.deliveries.length > 0) {
                setters.setSelectedDeliveries(this.normalizeDeliveries(response.data.deliveries));
            }
            state.isSaving = false;
        },
        addItem(itemId) {
            localStorage.setItem("user_cart", JSON.stringify([...getters.getValidItems().map((i) => ({ id: i.id, quantity: i.quantity })), {
                id: itemId,
                quantity: 1
            }]));
        },
        updateStorage() {
            localStorage.setItem("user_cart", JSON.stringify(getters.getValidItems().map((i) => ({ id: i.id, quantity: i.quantity }))));
        },
        clearStorage() {
            localStorage.removeItem("user_last_transaction");
            localStorage.removeItem("user_current_order");
        },
        normalizeDeliveries(deliveries) {
            return deliveries.map((delivery, index) => ({
                number: index + 1,
                delivery: {
                    id: delivery.id,
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
        getItemById(_itemId) {
            return state.items.find((i) => i.id == _itemId);
        },
        getSortedItemsByProducerName() {
            return orderBy(state.items, i => i.producer.name, ['asc']);
        },
        getProducersIds() {
            return state.items
            .map(p => p.producer.id)
            .reduce(
              (unique, item) =>
                unique.includes(item) ? unique : [...unique, item],
              []
            );
        },
        getItemsMappedByProducer() {
            return state.items.reduce((producers, cartItem) => {
                let producer = producers.find(p => p.id == cartItem.producer.id);

                producer
                    ? producer.nbProducts += cartItem.quantity
                    : producers = [
                        ...producers,
                        { 
                            ...cartItem.producer, 
                            nbProducts: cartItem.quantity 
                        }
                    ];
                
                return producers;
            }, []);
        },
        getValidItems() {
            return state.items.filter(p => p.quantity > 0 && !p.disabled && !p.producer.disabled);
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
                let hasProducerInCart = state.items.find((i) => i.producer.id == d.producerId);

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
        setItems(items) {
            update(state => {
                state.items = items;
                methods.updateStorage();
                return state;
            })
        },
        disableItems(itemIds) {
            itemIds.map((i) => {
                let item = getters.getItemById(i);
                item.disabled = true;
            })
        },
        disableProducers(producersIds) {
            producersIds.map((i) => {
                state.items.map((c) => {
                    if (c.producer.id == i) {
                        return {
                            ...c,
                            producer: {
                                ...c.producer,
                                disabled: true
                            }
                        }
                    }
                    else return c;
                });
            })
        },
        removeItem(itemId) {
            update(state => {
                state.items = state.items.filter(c => c.id !== itemId);
                methods.updateStorage();
                methods.updateCart();
                return state;
            })
        },
        updateItem(itemId, quantity) {
            update(state => {
                let product = getters.getItemById(itemId);
                
                if (!product) {
                    methods.addItem(itemId);
                } else {
                    product.quantity = quantity;
                    methods.updateStorage();
                }
                return state;
            })
            return methods.updateCart();
        },
        removeItemsWithProducer(producerId) {
            update(state => {
                state.items = state.items.filter(c => c.producer.id !== producerId);
                resetSelectedDeliveryForProducerId(producerId);
                methods.updateStorage();
                methods.updateCart();
                return state;
            })
        },
        reset() {
            update(state => {
                state.items = [];
                methods.updateStorage();
                localStorage.removeItem("user_last_transaction");
                localStorage.removeItem("user_current_order");
                return state;
            })
        },
        updateDelivery({ producerId, delivery, deliveryHour }) {
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
        setProducts(products) {
            update(state => {
                state.products = products;
                return state;
            });
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