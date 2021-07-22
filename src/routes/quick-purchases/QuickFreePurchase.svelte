<script>
	import { getContext, onMount } from "svelte";
	import SheaftErrors from "./../../services/SheaftErrors.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { GET_STORE_DELIVERIES_FOR_PRODUCERS, GET_ALL_PRODUCTS } from "./queries.js";
	import Select from "./../../components/controls/select/Select";
	import SearchProducerRoutes from "../search-producers/routes";
	import orderBy from "lodash/orderBy";
	import groupBy from "lodash/groupBy";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import QuickPurchaseDetails from "./QuickPurchaseDetails.svelte";

	const { open } = getContext("modal");
	const { query } = getContext("api");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let selectedProducerIds = [];
	let producers = [];
	let quickOrders = [];

	let isLoading = false;
	let dirty = false;
	let isLoadingDeliveries = true;

	const getAllAvailableProducts = async () => {
		isLoading = true;
		let products = await query({
			query: GET_ALL_PRODUCTS,
			errorsHandler,
			errorNotification: "Impossible de récupérer les produits commandables.",
		});
		await initProducersProducts(products);

		isLoading = false;
		dirty = false;
	};

	const initProducersProducts = async (products) => {
		if (products && products.length > 0) {
			const map = new Map();
			for (const item of products.map((r) => r.producer)) {
				if (!map.has(item.id)) {
					map.set(item.id, true);
					producers.push({
						id: item.id,
						name: item.name,
					});
				}
			}

			let producerProducts = groupBy(products, (x) => x.producer.id);
			Object.keys(producerProducts).forEach((key) => {
				let producer = producers.find((p) => p.id === key);
				producer.products = producerProducts[key].map((p) => ({ ...p, quantity: 0 }));
			});

			producers = orderBy(producers, (p) => p.name, ["asc"]);
		}

		selectedProducerIds = producers.map((p) => p.id);
		if (producers.length > 0) await loadDeliveries(selectedProducerIds);
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

	onMount(async () => {
		await getAllAvailableProducts();
	});
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
							selectedProducerIds = selectedVal.detail
								? selectedVal.detail.map((d) => d.id)
								: producers.map((p) => p.id);

							producers = producers.map((p) => ({ ...p, hide: !selectedProducerIds.includes(p.id) }));
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
		<QuickPurchaseDetails {producers} {isLoadingDeliveries} />
	</PageBody>
</TransitionWrapper>

<style lang="scss">
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
