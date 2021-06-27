<script>
	import { getContext, onMount } from "svelte";
	import SheaftErrors from "./../../services/SheaftErrors.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import DeliveryModePicker from "./DeliveryModePickerQuickOrder.svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { formatMoney } from "./../../helpers/app.js";
	import { GET_STORE_DELIVERIES_FOR_PRODUCERS, GET_ALL_PRODUCTS } from "./queries.js";
	import ConfirmOrder from "./ConfirmOrder.svelte";
	import Select from "./../../components/controls/select/Select";
	import MyOrdersRoutes from "../my-orders/routes";
	import SearchProducerRoutes from "../search-producers/routes";
	import orderBy from "lodash/orderBy";
	import groupBy from "lodash/groupBy";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const { open } = getContext("modal");
	const { query } = getContext("api");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let selectedProducers = [];
	let producers = [];

	let isLoading = false;
	let dirty = false;
	let isLoadingDeliveries = true;

	const getAllAvailableProducts = async () => {
		isLoading = true;
		await query({
			query: GET_ALL_PRODUCTS,
			errorsHandler,
			success: async (res) => {
				if (res && res.length > 0) {
					const map = new Map();
					for (const item of res.map((r) => r.producer)) {
						if (!map.has(item.id)) {
							map.set(item.id, true);
							producers.push({
								id: item.id,
								name: item.name,
							});
						}
					}

					let producerProducts = groupBy(res, (x) => x.producer.id);
					Object.keys(producerProducts).forEach((key) => {
						let producer = producers.find((p) => p.id === key);
						producer.products = producerProducts[key].map((p) => ({ ...p, quantity: 0 }));
					});

					producers = orderBy(producers, (p) => p.name, ["asc"]);
				}

				if (producers.length > 0) await loadDeliveries(producers.map((p) => p.id));
			},
			errorNotification: "Impossible de récupérer les produits commandables.",
		});
		isLoading = false;
		dirty = false;
	};

	const loadDeliveries = async (ids) => {
		isLoadingDeliveries = true;
		await query({
			query: GET_STORE_DELIVERIES_FOR_PRODUCERS,
			variables: { input: ids },
			errorsHandler,
			success: (res) => {
				res.data.forEach((item) => {
					let producer = producers.find((p) => p.id === item.id);
					producer.deliveries = item.deliveries;
				});
			},
			errorNotification: "Impossible de récupérer les informations de livraison.",
		});
		isLoadingDeliveries = false;
	};

	const handleLess = (producerId, productId) => {
		let producer = producers.find((p) => p.id === producerId);
		let product = producer.products.find((p) => p.id === productId);

		if (product.quantity !== 0) {
			product.quantity = (product.quantity || 1) - 1;
		}

		producers = producers;
		dirty = true;
	};

	const handleMore = (producerId, productId) => {
		let producer = producers.find((p) => p.id === producerId);
		let product = producer.products.find((p) => p.id === productId);
		product.quantity = (product.quantity || 0) + 1;

		producers = producers;
		dirty = true;
	};

	const handleSubmit = async () => {
		open(ConfirmOrder, {
			producers: producerWithProducts,
			onClose: () => routerInstance.goTo(MyOrdersRoutes.List),
		});
	};

	onMount(async () => {
		await getAllAvailableProducts();
	});

	$: displayedProducers =
		selectedProducers.length > 0 ? producers.filter((p) => selectedProducers.includes(p.id)) : producers;

	$: producerWithProducts = producers
		.map((p) => ({
			...p,
			products: p.products.filter((pr) => pr.quantity > 0),
		}))
		.filter((p) => p.products.length > 0);

	$: productsCount = producerWithProducts.reduce((sum, producer) => {
		return (
			sum +
			producer.products.reduce((productSum, product) => {
				return productSum + product.quantity;
			}, 0)
		);
	}, 0);

	$: totalReturnable = producerWithProducts.reduce((sum, producer) => {
		return (
			sum +
			producer.products.reduce((productSum, product) => {
				return productSum + (product.returnable ? product.returnable.wholeSalePrice : 0) * (product.quantity || 0);
			}, 0)
		);
	}, 0);

	$: totalProductsHt = producerWithProducts.reduce((sum, producer) => {
		return (
			sum +
			producer.products.reduce((productSum, product) => {
				return productSum + product.wholeSalePricePerUnit * (product.quantity || 0);
			}, 0)
		);
	}, 0);

	$: totalHt = producerWithProducts.reduce((sum, producer) => {
		return (
			sum +
			producer.products.reduce((productSum, product) => {
				return (
					productSum +
					(product.wholeSalePricePerUnit + (product.returnable ? product.returnable.wholeSalePrice : 0)) *
						(product.quantity || 0)
				);
			}, 0)
		);
	}, 0);

	$: totalVat = producerWithProducts.reduce((sum, producer) => {
		return (
			sum +
			producer.products.reduce((productSum, product) => {
				return (
					productSum +
					(product.vatPricePerUnit + (product.returnable ? product.returnable.vatPrice : 0)) * (product.quantity || 0)
				);
			}, 0)
		);
	}, 0);

	$: totalTtc = producerWithProducts.reduce((sum, producer) => {
		return (
			sum +
			producer.products.reduce((productSum, product) => {
				return (
					productSum +
					(product.onSalePricePerUnit + (product.returnable ? product.returnable.onSalePrice : 0)) *
						(product.quantity || 0)
				);
			}, 0)
		);
	}, 0);

	$: isValid = producerWithProducts.filter((p) => !p.delivery).length === 0;
</script>

<TransitionWrapper>
	<PageHeader name="Passer une commande" />
	<PageBody
		{errorsHandler}
		{isLoading}
		noResults={producers.length < 1}
		noResultsPage={SearchProducerRoutes.NoResults}
		loadingMessage="Chargement des produits disponibles."
	>
		<form on:submit|preventDefault={handleSubmit}>
			{#if producers.length > 1}
				<div class="mb-5">
					<div class="themed w-full">
						<Select
							items={producers}
							getOptionLabel={(l) => l.name}
							getSelectionLabel={(l) => l.name}
							showChevron={true}
							hideSelectedOnFocus={true}
							on:select={(selectedVal) => {
								selectedProducers = selectedVal.detail ? selectedVal.detail.map((d) => d.id) : [];
							}}
							optionIdentifier="id"
							placeholder="Filtrez les producteurs"
							noOptionsMessage="Aucun producteur trouvé"
							isSearchable={true}
							isMulti={true}
							isClearable={false}
							containerStyles="font-weight: 600; color: #4a5568;"
						/>
					</div>
				</div>
			{/if}
			<div class="lg:flex lg:flex-row">
				<div class="mx-0 overflow-x-auto w-full lg:w-8/12 lg:pr-12">
					<div class="align-middle inline-block min-w-full overflow-hidden items mb-5">
						{#each displayedProducers as producer}
							<p
								style="border-bottom: 0;"
								class="text-lg font-semibold uppercase border border-gray-400 py-2 pl-3 bg-gray-100 mt-5"
							>
								{producer.name}
							</p>
							<DeliveryModePicker
								bind:selected={producer.delivery}
								bind:selectedDeliveryHour={producer.deliveryHour}
								data={producer}
								displayLocation={false}
								isLoading={isLoadingDeliveries}
							/>
							{#each producer.products as product}
								<div
									class="px-2 md:px-3 py-4 block md:flex md:flex-row bg-white border-b border-l border-r
              border-gray-400 border-solid items-center"
									class:bg-blue-100={product.quantity > 0}
								>
									<div class="md:w-6/12 px-3">
										<div class="text-lg leading-5 font-medium">
											<p>{product.name}</p>
										</div>
										<div class="text-sm leading-5">{formatMoney(product.wholeSalePricePerUnit)} / unité</div>
									</div>
									<div class="md:w-2/12 px-3 block md:hidden">
										<p>
											<span class="font-bold text-xl">
												{formatMoney(product.wholeSalePricePerUnit * product.quantity || 0)} HT
											</span>
										</p>
									</div>
									<div class="w-12/12 md:w-5/12 xl:w-3/12 px-3">
										{#if product.available}
											<div class="flex m-auto border border-gray-400 border-solid rounded-full product-quantity">
												<button
													disabled={product.quantity === 0}
													style="height: 36px;"
													type="button"
													aria-label="Retirer 1"
													class="font-bold
                        transition duration-300 ease-in-out text-sm w-full rounded-l-full focus:outline-none  hover:bg-accent hover:text-white text-accent"
													on:click|stopPropagation={() => handleLess(producer.id, product.id)}
												>
													-
												</button>
												<input
													min="0"
													max="999"
													type="number"
													on:click|stopPropagation
													on:input={(e) => {
														if (!dirty) dirty = true;

														if (e.target.value.length > e.target.maxLength) {
															e.target.value = e.target.value.slice(0, e.target.maxLength);
														}
													}}
													maxLength="3"
													bind:value={product.quantity}
													class:font-bold={product.quantity > 0}
													class="text-center w-full border-none rounded-none p-1 text-sm lg:text-base"
													class:bg-blue-100={product.quantity > 0}
												/>
												<button
													type="button"
													style="height: 36px;"
													class="font-bold
                        transition duration-300 ease-in-out text-sm w-full rounded-r-full focus:outline-none text-accent hover:bg-accent hover:text-white"
													aria-label="Ajouter 1"
													on:click|stopPropagation={() => handleMore(producer.id, product.id)}
												>
													+
												</button>
											</div>
										{:else}
											<div>Non disponible</div>
										{/if}
									</div>
									<div class="md:w-3/12 px-3 text-right hidden md:block">
										<p class="font-semibold text-lg">
											{formatMoney(product.wholeSalePricePerUnit * product.quantity || 0)}
										</p>
										<p class="text-sm">H.T</p>
									</div>
								</div>
							{/each}
							<div class="bg-white border-b border-l border-r border-gray-400 border-solid">
								<p class="p-2">Remarques :</p>
								<textarea bind:value={producer.comment} />
							</div>
						{/each}
					</div>
				</div>
				<div class="w-full lg:w-4/12">
					<div
						class="py-2 mb-6 pb-5 px-2 lg:px-6 lg:py-8 static lg:block
            bg-white shadow w-full"
						style="height: fit-content;"
					>
						<div class="flex justify-between w-full lg:px-3 pb-2">
							<div class="text-left">
								<p>Montant HT</p>
								<p class="text-sm text-gray-600">
									{#if productsCount > 0}
										{productsCount} article{productsCount > 1 ? "s" : ""}
									{:else}Aucun article
									{/if}
								</p>
							</div>
							<div>
								<p>{formatMoney(totalProductsHt)}</p>
							</div>
						</div>
						<div class="flex justify-between w-full lg:px-3 pb-2">
							<div class="text-left">
								<p>Consignes HT</p>
							</div>
							<p>{formatMoney(totalReturnable)}</p>
						</div>
						<div class="flex justify-between w-full lg:px-3 border-t border-gray-400 pt-2">
							<div class="text-left">
								<p class="uppercase font-semibold">Total HT</p>
							</div>
							<div>
								<p class="font-bold text-lg">{formatMoney(totalHt)}</p>
							</div>
						</div>
						<div class="flex justify-between w-full lg:px-3 pt-2">
							<div class="text-left">
								<p class="uppercase font-semibold">Total TVA</p>
							</div>
							<div>
								<p class="font-bold text-lg">{formatMoney(totalVat)}</p>
							</div>
						</div>
						<div class="flex justify-between w-full lg:px-3 pt-2">
							<div class="text-left">
								<p class="uppercase font-semibold">Total TTC</p>
							</div>
							<div>
								<p class="font-bold text-lg">{formatMoney(totalTtc)}</p>
							</div>
						</div>
						<div class="pt-2 lg:pt-3">
							<button
								type="submit"
								class:disabled={productsCount === 0 || !isValid}
								disabled={productsCount === 0 || !isValid}
								class="btn btn-primary btn-lg uppercase w-full lg:w-8/12
                justify-center m-auto"
								style="padding-left: 50px; padding-right: 50px;"
							>
								Valider
							</button>
						</div>
					</div>
				</div>
			</div>
		</form>
	</PageBody>
</TransitionWrapper>

<style lang="scss">
	button:active {
		transform: scale(0.9);
	}

	.product-quantity {
		max-width: 200px;

		input {
			max-width: 80px;
		}
	}

	@media (max-width: 1024px) {
		.product-quantity {
			max-width: 130px;

			input {
				max-width: 50px;
			}
		}
	}

	.plusButton,
	.minusButton {
		&:hover {
			background-color: #009688;
			@apply text-white;
		}

		&.active {
			background-color: #009688;
			@apply text-white;

			&:hover {
				background-color: #009688;
			}
		}
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type="number"] {
		-moz-appearance: textfield;
	}

	.themed {
		--cursor: text;
		--padding: 22px 16px;
		--borderFocusColor: #a0aec0;
		--borderHoverColor: #a0aec0;
		--border: 1px solid #cbd5e0;
		--placeholderColor: #205164;
		--inputPadding: 45px;
		--inputColor: #205164;
		--multiItemMargin: 0 5px;
		--multiItemActiveBG: #edf2f7;
		--multiItemActiveColor: #205164;
		--multiClearHoverFill: #ff4081;
	}
</style>
