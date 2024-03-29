<script>
	import { GET_BATCHES, GET_BATCH_DETAILS } from "./queries";
	import { onMount, getContext } from "svelte";
	import { getIsoDate } from "../../helpers/app";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import SheaftErrors from "../../services/SheaftErrors";
	import Icon from "svelte-awesome";
	import { faPaperPlane, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import GetRouterInstance from "../../services/SheaftRouter";
	import BatchesRoutes from "./routes";
	import ProductRoutes from "./../products/routes";
	import { UPDATE_BATCH } from "./mutations";
	import DatePickerWrapper from "./../../components/controls/DatePickerWrapper.svelte";
	import Observations from "../../components/observations/Observations.svelte";
	import { querystring } from "svelte-spa-router";
	import CreateBatchObservation from "./CreateBatchObservation.svelte";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";

	export let params = {};

	const { query, mutate } = getContext("api");
	const { open } = getContext("modal");
	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();

	let batch;
	let displayObservationsPanel = false;
	let isLoading = true;
	let isSubmitting = false;

	let dlcOrDluo = "dlc";
	let expirationDate = new Date();

	onMount(async () => {
		await getBatch();
	});

	const getBatch = async () => {
		isLoading = true;
		batch = await query({
			query: GET_BATCH_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(BatchesRoutes.List),
			errorNotification: "Impossible de trouver le lot.",
			skipCache: routerInstance.shouldSkipCache(),
		});
		dlcOrDluo = batch.dlc ? "dlc" : "ddm";
		expirationDate = batch.dlc ? new Date(batch.dlc) : new Date(batch.ddm);

		isLoading = false;
	};

	const handleSubmit = async () => {
		isSubmitting = true;
		await mutate({
			mutation: UPDATE_BATCH,
			variables: {
				id: batch.id,
				number: batch.number,
				dlc: dlcOrDluo == "dlc" ? getIsoDate(expirationDate) : null,
				ddm: dlcOrDluo == "ddm" ? getIsoDate(expirationDate) : null,
			},
			errorsHandler,
			success: (res) => routerInstance.goTo(BatchesRoutes.List),
			successNotification: "Lot modifié avec succès",
			error: () => routerInstance.goTo(BatchesRoutes.List),
			errorNotification: "Impossible de modifier le lot",
			clearCache: [GET_BATCHES],
		});
		isSubmitting = false;
	};

	const showAddObservationModal = () => {
		open(CreateBatchObservation, {
			batch: batch,
			onClose: (res) => {
				if (res.success) routerInstance.refresh();
			},
		});
	};

	$: getBatch($querystring);

	$: buttons =
		batch && batch.observationsCount === 0
			? [
					{
						text: "Ajouter une observation",
						click: () => showAddObservationModal(),
						color: "blue",
					},
			  ]
			: [];
</script>

<TransitionWrapper>
	<PageHeader name="Détails du lot {batch ? batch.number : ''}" previousPage={BatchesRoutes.List} {buttons} />
	<PageBody {errorsHandler} {isLoading}>
		{#if batch.observationsCount > 0}
			<div
				class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-blue-100
				shadow md:rounded md:mb-3 mt-3"
			>
				<p class="uppercase font-bold leading-none">Des observations ont été remontées !</p>
				<div class="mt-2">
					<p>
						Des observations ont été remontées par vous ou par un ou plusieurs magasins concernant ce lot.
					</p>
					<p>Vous pouvez les consulter en cliquant sur le bouton ci-dessous.</p>
					<button class="btn btn-outline btn-lg mt-2" on:click={() => (displayObservationsPanel = true)}
						>Voir les observations</button
					>
				</div>
			</div>
		{/if}
		<div class="form-control text-left mt-3">
			<label for="batch">Numéro du lot *</label>
			<input bind:value={batch.number} id="batch" type="text" disabled={batch.lockedForEditing} />
		</div>

		{#if !batch.lockedForEditing}
			<div class="form-control">
				<div class="flex w-full">
					<div class="w-full">
						<div class="w-full text-lg justify-center button-group">
							<button
								on:click={() => (dlcOrDluo = "dlc")}
								type="button"
								class="text-sm md:text-base"
								disabled={batch.lockedForEditing}
								class:selected={dlcOrDluo == "dlc"}
								class:skeleton-box={isLoading || isSubmitting}
							>
								DLC
							</button>
							<button
								on:click={() => (dlcOrDluo = "ddm")}
								type="button"
								class="text-sm md:text-base"
								disabled={batch.lockedForEditing}
								class:selected={dlcOrDluo == "ddm"}
								class:skeleton-box={isLoading || isSubmitting}
							>
								DDM
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
		<div class="form-control text-left" style="display:block;">
			<label>{dlcOrDluo == "dlc" ? "DLC *" : "DDM *"}</label>
			{#if batch.lockedForEditing}
				<p>
					{format(new Date(expirationDate), "PPPP", {
						locale: fr,
					})}
				</p>
			{:else}
				<DatePickerWrapper bind:selected={expirationDate} dateChosen={true} />
			{/if}
		</div>
		{#if batch.products && batch.products.length > 0}
			<div class="form-control text-left mt-5 mb-2">
				<label>Produits concernés par ce lot</label>
			</div>
			<div class="flex items-left mb-4">
				{#each batch.products as product}
					<a
						class="bg-white overflow-hidden rounded-lg p-3 lg:p-6 shadow mr-3"
						href="javascript:void(0)"
						on:click={() => routerInstance.goTo(ProductRoutes.Details, { id: product.id })}
						>{product.name}</a
					>
				{/each}
			</div>
		{/if}
		{#if !batch.lockedForEditing}
			<small>* champs requis</small>
			<div class="form-control mt-5">
				<button
					type="button"
					disabled={isLoading || isSubmitting}
					class:disabled={isLoading || isSubmitting}
					on:click={handleSubmit}
					class="btn btn-primary btn-xl justify-center w-full md:w-auto"
				>
					<Icon data={isSubmitting ? faCircleNotch : faPaperPlane} class="mr-2 inline" spin={isSubmitting} />
					Valider
				</button>
			</div>
		{/if}

		{#if displayObservationsPanel}
			<Observations
				title="Observations du lot {batch.number}"
				{batch}
				on:close={() => (displayObservationsPanel = false)}
			/>
		{/if}
	</PageBody>
</TransitionWrapper>
