<script>
	import { getContext, onMount } from "svelte";
	import SheaftErrors from "./../../services/SheaftErrors.js";
	import GetRouterInstance from "./../../services/SheaftRouter.js";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { GET_STORE_DELIVERIES_FOR_PRODUCERS, GET_PURCHASE_QUICKORDERS } from "./queries.js";
	import Select from "./../../components/controls/select/Select";
	import QuickOrderRoutes from "./../quick-orders/routes";
	import orderBy from "lodash/orderBy";
	import groupBy from "lodash/groupBy";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import QuickPurchaseDetails from "./QuickPurchaseDetails.svelte";

	const { open } = getContext("modal");
	const { query } = getContext("api");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let selectedProducers = [];
	let producers = [];
	let quickOrders = [];
	let selectedQuickOrder = null;

	let isLoading = false;
	let dirty = false;
	let isLoadingDeliveries = true;

	const getQuickOrders = async () => {
		isLoading = true;
		quickOrders = await query({
			query: GET_PURCHASE_QUICKORDERS,
			errorsHandler,
			errorNotification: "Impossible de récupérer les modèles de commandes.",
		});

		if (quickOrders.length === 1) selectedQuickOrder = quickOrders[0];
		else if (quickOrders.length > 1) {
			selectedQuickOrder = quickOrders.filter((qo) => qo.isDefault)[0];
		}

		if (selectedQuickOrder) await initProducersProducts(selectedQuickOrder.products);

		isLoading = false;
	};

	const initProducersProducts = async (products) => {
		producers = [];
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
				producer.products = producerProducts[key].map((p) => ({ ...p, quantity: p.quantity ?? 0 }));
			});

			producers = orderBy(producers, (p) => p.name, ["asc"]);
		}

		if (producers.length > 0) await loadDeliveries(producers.map((p) => p.id));
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
		await getQuickOrders();
	});
</script>

<TransitionWrapper>
	<PageHeader name="Commande rapide" />
	<PageBody
		{errorsHandler}
		{isLoading}
		noResults={quickOrders.length < 1}
		noResultsPage={QuickOrderRoutes.NoResults}
		loadingMessage="Chargement des modèles de commande."
	>
		{#if quickOrders.length > 1}
			<div class="mb-5">
				<div class="themed w-full">
					<Select
						items={quickOrders}
						bind:selectedValue={selectedQuickOrder}
						getOptionLabel={(l) => l.name}
						getSelectionLabel={(l) => l.name}
						showChevron={true}
						hideSelectedOnFocus={true}
						on:select={(value) => initProducersProducts(value.detail.products)}
						optionIdentifier="id"
						placeholder="Choisir un modèle de commande"
						noOptionsMessage="Aucun modèle trouvé"
						isSearchable={true}
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
