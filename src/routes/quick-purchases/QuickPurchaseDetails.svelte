<script>
	import { getContext, onMount } from "svelte";
	import SheaftErrors from "./../../services/SheaftErrors.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import QuickDeliveryModePicker from "./QuickDeliveryModePicker.svelte";
	import { formatMoney, formatConditioningDisplay } from "./../../helpers/app.js";
	import ConfirmPurchaseModal from "./ConfirmPurchaseModal.svelte";
	import MyOrdersRoutes from "../my-orders/routes";
	import DeliveryFeesApplication from "../../enums/DeliveryFeesApplication.js";

	const { open } = getContext("modal");
	const routerInstance = GetRouterInstance();

	export let producers = [],
		isLoadingDeliveries = false;

	let dirty = false;

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
		open(ConfirmPurchaseModal, {
			producers: producerWithProducts,
			onClose: () => routerInstance.goTo(MyOrdersRoutes.List),
		});
	};

	const resetProducer = (producer) => {
		producer.delivery = null;
		producer.deliveryHour = null;
		producer.products = producer.products.map((p) => {
			p.quantity = 0;
			return p;
		});

		producers = producers;
	};

	$: producerWithProducts = producers
		.map((p) => ({
			...p,
			products: p.products?.filter((pr) => pr.quantity > 0) ?? [],
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
				return (
					productSum + (product.returnable ? product.returnable.wholeSalePrice : 0) * (product.quantity || 0)
				);
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
					(product.vatPricePerUnit + (product.returnable ? product.returnable.vatPrice : 0)) *
						(product.quantity || 0)
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

	$: totalDeliveriesFeesHt = producerWithProducts
		.filter(
			(pwp) =>
				pwp.delivery && pwp.delivery.deliveryFeesWholeSalePrice && pwp.delivery.deliveryFeesWholeSalePrice > 0
		)
		.reduce((deliveryFeesSum, producer) => {
			return deliveryFeesSum + producerDeliveryFees(producer).deliveryFeesHt;
		}, 0);

	$: totalDeliveriesFeesVat = producerWithProducts
		.filter(
			(pwp) =>
				pwp.delivery && pwp.delivery.deliveryFeesWholeSalePrice && pwp.delivery.deliveryFeesWholeSalePrice > 0
		)
		.reduce((deliveryFeesSum, producer) => {
			return deliveryFeesSum + producerDeliveryFees(producer).deliveryFeesVat;
		}, 0);

	$: totalDeliveriesFeesTtc = producerWithProducts
		.filter(
			(pwp) =>
				pwp.delivery && pwp.delivery.deliveryFeesWholeSalePrice && pwp.delivery.deliveryFeesWholeSalePrice > 0
		)
		.reduce((deliveryFeesSum, producer) => {
			return deliveryFeesSum + producerDeliveryFees(producer).deliveryFeesTtc;
		}, 0);

	$: producerDeliveryFees = (producer) => {
		if (
			producer.delivery &&
			producer.delivery.applyDeliveryFeesWhen &&
			producer.delivery.applyDeliveryFeesWhen == DeliveryFeesApplication.TotalLowerThanPurchaseOrderAmount.Value
		) {
			let totalProducerOrder = producer.products.reduce((productSum, product) => {
				return (
					productSum +
					(product.wholeSalePricePerUnit + (product.returnable ? product.returnable.wholeSalePrice : 0)) *
						(product.quantity || 0)
				);
			}, 0);

			if (totalProducerOrder < producer.delivery.deliveryFeesMinPurchaseOrdersAmount)
				return {
					deliveryFeesHt: producer.delivery.deliveryFeesWholeSalePrice,
					deliveryFeesVat: producer.delivery.deliveryFeesVatPrice,
					deliveryFeesTtc: producer.delivery.deliveryFeesOnSalePrice,
				};
		} else if (
			producer.delivery &&
			producer.delivery.applyDeliveryFeesWhen &&
			producer.delivery.applyDeliveryFeesWhen == DeliveryFeesApplication.Always.Value
		)
			return {
				deliveryFeesHt: producer.delivery.deliveryFeesWholeSalePrice,
				deliveryFeesVat: producer.delivery.deliveryFeesVatPrice,
				deliveryFeesTtc: producer.delivery.deliveryFeesOnSalePrice,
			};

		return {
			deliveryFeesHt: 0,
			deliveryFeesVat: 0,
			deliveryFeesTtc: 0,
		};
	};

	$: producerRequireMoreProducts = (producer) => {
		if (producer.delivery && producer.delivery.acceptPurchaseOrdersWithAmountGreaterThan) {
			let totalProducerOrder = producer.products.reduce((productSum, product) => {
				return (
					productSum +
					(product.wholeSalePricePerUnit + (product.returnable ? product.returnable.wholeSalePrice : 0)) *
						(product.quantity || 0)
				);
			}, 0);

			return totalProducerOrder < producer.delivery.acceptPurchaseOrdersWithAmountGreaterThan;
		}
		return false;
	};

	$: isValid =
		producerWithProducts.filter((p) => !p.delivery).length === 0 &&
		producerWithProducts.filter((p) => producerRequireMoreProducts(p)).length === 0;
</script>

<form on:submit|preventDefault={handleSubmit}>
	<div class="lg:flex lg:flex-row">
		<div class="mx-0 overflow-x-auto w-full lg:w-8/12 lg:pr-12">
			<div class="align-middle inline-block min-w-full overflow-hidden items mb-5">
				{#each producers.filter((p) => !p.hide) as producer}
					<div
						style="border-bottom: 0;"
						class="flex align-middle justify-between text-lg font-semibold uppercase border border-gray-400 py-2 pl-3 bg-gray-100 mt-5"
					>
						<div>
							{producer.name}
						</div>
						{#if producer.delivery || producer.products.filter((p) => p.quantity > 0).length > 0}
							<div
								class="text-accent mt-1 mr-2 cursor-pointer uppercase font-medium text-xs"
								on:click={() => resetProducer(producer)}
							>
								Réinitialiser
							</div>
						{/if}
					</div>
					<QuickDeliveryModePicker
						bind:selected={producer.delivery}
						bind:selectedDeliveryHour={producer.deliveryHour}
						data={producer}
						displayLocation={false}
						isLoading={isLoadingDeliveries}
					/>
					{#if producerRequireMoreProducts(producer)}
						<div
							class="px-2 md:px-3 py-4 block bg-red-100 border-b border-l border-r
              border-gray-400 border-solid items-center"
						>
							Ce producteur n'accepte que des commandes de plus de <strong
								>{producer.delivery.acceptPurchaseOrdersWithAmountGreaterThan}€ HT</strong
							>
						</div>
					{/if}
					{#if producerDeliveryFees(producer).deliveryFeesTtc > 0}
						<div
							class="px-2 md:px-3 py-4 block bg-teal-100 border-b border-l border-r
              border-gray-400 border-solid items-center"
						>
							<div>
								<strong
									>Frais de livraison : {producerDeliveryFees(producer).deliveryFeesHt}€ HT</strong
								>
							</div>
							{#if producer.delivery.applyDeliveryFeesWhen && producer.delivery.applyDeliveryFeesWhen == DeliveryFeesApplication.TotalLowerThanPurchaseOrderAmount.Value}
								<div>
									Ces frais s'appliquent uniquement sur les commandes inférieures à <strong
										>{producer.delivery.deliveryFeesMinPurchaseOrdersAmount}€ HT</strong
									>
								</div>
							{/if}
						</div>
					{/if}
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
								<div class="text-sm leading-5">
									{formatMoney(
										product.wholeSalePricePerUnit +
											(product.returnable ? product.returnable.wholeSalePrice : 0)
									)} / unité
								</div>
								<div class="text-sm leading-5">
									{formatConditioningDisplay(
										product.conditioning,
										product.quantityPerUnit,
										product.unit
									)}
								</div>
							</div>
							<div class="md:w-2/12 px-3 block md:hidden">
								<p>
									<span class="font-bold text-xl">
										{formatMoney(
											(product.wholeSalePricePerUnit +
												(product.returnable ? product.returnable.wholeSalePrice : 0)) *
												product.quantity || 0
										)} HT
									</span>
								</p>
							</div>
							<div class="w-12/12 md:w-5/12 xl:w-3/12 px-3">
								{#if product.available}
									<div
										class="flex m-auto border border-gray-400 border-solid rounded-full product-quantity"
									>
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
									{formatMoney(
										(product.wholeSalePricePerUnit +
											(product.returnable ? product.returnable.wholeSalePrice : 0)) *
											product.quantity || 0
									)}
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
		{#if producers && producers.length > 0}
			<div class="w-full lg:w-4/12">
				<div
					class="py-2 mb-6 pb-5 px-2 lg:px-6 lg:py-8 static lg:block
            bg-white shadow w-full"
					style="height: fit-content;"
				>
					<div class="flex justify-between w-full lg:px-3 pb-2">
						<div class="text-left">
							<p>Produits HT</p>
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
					{#if totalDeliveriesFeesHt > 0}
						<div class="flex justify-between w-full lg:px-3 pb-2">
							<div class="text-left">
								<p>Livraisons HT</p>
							</div>
							<p>{formatMoney(totalDeliveriesFeesHt)}</p>
						</div>
					{/if}
					<div class="flex justify-between w-full lg:px-3 border-t border-gray-400 pt-2">
						<div class="text-left">
							<p class="uppercase font-semibold">Total HT</p>
						</div>
						<div>
							<p class="font-bold text-lg">{formatMoney(totalHt + totalDeliveriesFeesHt)}</p>
						</div>
					</div>
					<div class="flex justify-between w-full lg:px-3 pt-2">
						<div class="text-left">
							<p class="uppercase font-semibold">Total TVA</p>
						</div>
						<div>
							<p class="font-bold text-lg">{formatMoney(totalVat + totalDeliveriesFeesVat)}</p>
						</div>
					</div>
					<div class="flex justify-between w-full lg:px-3 pt-2">
						<div class="text-left">
							<p class="uppercase font-semibold">Total TTC</p>
						</div>
						<div>
							<p class="font-bold text-lg">{formatMoney(totalTtc + totalDeliveriesFeesTtc)}</p>
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
		{/if}
	</div>
</form>

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
