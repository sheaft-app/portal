import { writable } from "svelte/store";
import { GET_CART } from "./queries";
import { CREATE_CONSUMER_ORDER, UPDATE_CONSUMER_ORDER } from "./mutations.js";
import debounce from "lodash/debounce";
import orderBy from "lodash/orderBy";

const store = () => {
    let graphQLInstance = null;
    let errorsHandler = null;

    const state = {
        items: [],
        itemsOrderedByProducer: [],
        selectedDeliveries: [],
        isInitializing: true,
        isLoadingNewProduct: false,
        userCurrentOrder: null
    }
    
    const { subscribe, set, update } = writable(state);

    const methods = {
        async initialize(apiInstance, errorsHandlerInstance) {
            graphQLInstance = apiInstance;
            errorsHandler = errorsHandlerInstance;

            const currentOrder = JSON.parse(localStorage.getItem("user_current_order"));
            let products = [];

            if (currentOrder) {
                const res = await graphQLInstance.query(GET_CART, { input: currentOrder });

                if (!res.success) {
                    // todo
                    return;
                }

                products = res.data.products;
            }

            update(state => {
                state.isInitializing = false;
                state.items = products;

                if (currentOrder)
                    state.userCurrentOrder = currentOrder;

                return state;
            });
        },
        async updateCart() {
            const orderMutation = state.userCurrentOrder ? UPDATE_CONSUMER_ORDER : CREATE_CONSUMER_ORDER;
            const variables = {
                id: state.userCurrentOrder,
                donation: "NONE",
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

                return state;
            }

            state.userCurrentOrder = response.data.id;
            localStorage.setItem("user_current_order", JSON.stringify(response.data.id));

            return setters.setItems(response.data.products);
        },
        addItem(itemId) {
            localStorage.setItem("user_cart", JSON.stringify([...getters.getValidItems().map((i) => ({ id: i.id, quantity: i.quantity })), {
                id: itemId,
                quantity: 1
            }]));
        },
        updateStorage() {
            localStorage.setItem("user_cart", JSON.stringify(getters.getValidItems().map((i) => ({ id: i.id, quantity: i.quantity }))));
        }
    };

    const getters = {
        getItemById(_itemId) {
            return state.items.find((i) => i.id == _itemId);
        },
        getItemQuantity(_itemId) {
            let item = this.getItemById(_itemId);

            if (item && item.quantity) 
                return item.quantity;
            return 0;
        },
        getItemsOrderedByProducer(_itemId) {
            // todo
            // return state.items.find((i) => i.id == _itemId);
        },
        getLinesCount() {
            return state.items.length;
        },
        getIsEmpty() {
            return state.items.length == 0;
        },
        getSortedItemsByProducerName() {
            return orderBy(state.items, i => i.producer.name, ['asc']);
        },
        getProducersIdsInCart() {
            return state.items
            .map(p => p.producer.id)
            .reduce(
              (unique, item) =>
                unique.includes(item) ? unique : [...unique, item],
              []
            );
        },
        getItemsMappedByProducer() {
            return state.items.filter(c => c.producer.delivery && c.producer.delivery.address && c.producer.delivery.address.latitude && c.producer.delivery.address.longitude)
            .map((cartItem, i) => {
                let producer = state.items.find(
                c => {
                    return c.delivery.address.latitude === cartItem.producer.delivery.address.latitude &&
                    c.delivery.address.longitude === cartItem.producer.delivery.address.longitude
                }
                );

                producer
                ? (producer.nbProducts += cartItem.quantity)
                : (producerWithProductsCount = [
                    ...producerWithProductsCount,
                    { ...cartItem.producer, nbProducts: cartItem.quantity, index: producerWithProductsCount.length + 1 }
                    ]);
            });
        },
        getTotalProductsCount() {
            return state.items.reduce((sum, product) => {
                return sum + (product.quantity || 0);
            }, 0);
        },
        getTotalAmount() {
            return state.items.reduce((sum, product) => {
                return parseFloat(sum) + product.unitOnSalePrice * product.quantity || 0;
            }, 0);
        },
        getValidItems() {
            return state.items.filter(p => p.quantity > 0 && !p.disabled && !p.producer.disabled);
        },
        getDeliveryByProducerId(_producerId) {
            return state.selectedDeliveries.find((d) => d.producerId == _producerId);
        },
        getAllSelectedDeliveries() {
            return state.selectedDeliveries;
        },
        getHasSelectedDeliveryForEveryProducer() {
            return state.selectedDeliveries.find((p) => !p.delivery);
        },
        getItemsWithData() {
            return state.items.filter(p => p.name);
        },
        getNormalizedProducts() {
            let products = JSON.parse(localStorage.getItem("user_cart"));

            return products.map(product => ({
                id: product.id,
                quantity: product.quantity
            }));
        },
        getNormalizedSelectedDeliveries() {
            if (!getters.getHasSelectedDeliveryForEveryProducer()) {
                return null;
            }

            return state.selectedDeliveries
                .map((d) => ({
                    producerId: d.producerId,
                    deliveryModeId: d.delivery ? d.delivery.id : null,
                    expectedDeliveryDate: d.deliveryHour ? d.deliveryHour.expectedDeliveryDate : null
                })
                .filter((producer, index, self) =>
                    index === self.findIndex(t => t.producerId === producer.producerId)
                ));
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
        removeItem(itemId) {
            update(state => {
                state.items = state.items.filter(c => c.id !== itemId);
                methods.updateStorage();
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
                methods.updateStorage();
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

                if (delivery) {
                    deliveryMode.delivery = delivery;
                    deliveryMode.deliveryHour = deliveryHour;
                } else {
                    state.selectedDeliveries = [...state.selectedDeliveries, {
                        producerId, delivery, deliveryHour
                    }];
                }
                
                return state;
            })
        },
        setProducts(products) {
            update(state => {
                state.products = products;
                return state;
            });
        }
    };

    // writable(state).subscribe(value => {
    //     debounce(methods.updateCart(), 800);
    // });

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