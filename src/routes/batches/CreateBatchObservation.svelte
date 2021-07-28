<script>
	import ActionConfirm from "../../components/modal/ActionConfirm.svelte";
	import { CREATE_BATCH_OBSERVATION } from "./mutations";
	import { getContext, onMount } from "svelte";
	import { faCheck } from "@fortawesome/free-solid-svg-icons";
	import SheaftErrors from "../../services/SheaftErrors";
	import InputCheckbox from "../../components/controls/InputCheckbox.svelte";
	import { GET_PRODUCTS } from "../catalogs/queries";
	import Toggle from "../../components/controls/Toggle.svelte";

	export let close, onClose, batch;

	const errorsHandler = new SheaftErrors();
	const { mutate, query } = getContext("api");

	let comment = null;
	let visibleToAll = false;
	let isLoading = false;
	let products = [];

	const handleSubmit = async () => {
		isLoading = true;
		await mutate({
			mutation: CREATE_BATCH_OBSERVATION,
			variables: {
				comment,
				visibleToAll,
				productIds: products.filter((p) => p.checked).map((p) => p.id),
				batchIds: [batch.id],
			},
			errorsHandler,
			success: async (res) => {
				await onClose({ success: true, data: res });
				close();
			},
			successNotification: "Observation créée avec succès",
			errorNotification: "Impossible de créer l'observation",
		});
		isLoading = false;
	};

	const toggleAll = () => {
		let checked = !hasSelectedAll;
		products = products.map((p) => ({
			...p,
			checked: checked,
		}));
	};

	onMount(async () => {
		await query({
			query: GET_PRODUCTS,
			errorsHandler,
			success: (res) => {
				products = res.map((p) => ({
					...p,
					checked: false,
				}));
			},
			error: () => close(),
			errorNotification: "Impossible de récupérer les informations de vos produits",
		});
	});

	$: hasSelectedAll = products.filter((p) => !p.checked).length === 0;
</script>

<ActionConfirm
	{errorsHandler}
	title="Créer une observation"
	submit={handleSubmit}
	{isLoading}
	{close}
	valid={comment && comment.length > 0}
	submitText="Confirmer"
	icon={faCheck}
	closeText="Fermer"
>
	<div class="form-control text-left">
		<label for="comment">Remarque *</label>
		<textarea bind:value={comment} id="comment" />
	</div>
	<div class="form-control">
		<label>Visible pour tous vos clients</label>
		<Toggle
			labelPosition="left"
			disabled={isLoading}
			classNames="ml-1"
			isChecked={visibleToAll}
			onChange={() => (visibleToAll = !visibleToAll)}
		/>
	</div>
	<div class="form-control">
		<label>Produits concernés :</label>
	</div>
	<div class="mb-4">
		<div class="flex items-center cursor-pointer mt-3 mb-2" on:click={() => toggleAll()}>
			<div class="w-1/12">
				<InputCheckbox checked={hasSelectedAll} />
			</div>
			<p class>Tout sélectionner</p>
		</div>
		{#each products as product}
			<div
				class="flex border-b border-gray-400 py-2 items-center cursor-pointer"
				on:click={() => (product.checked = !product.checked)}
			>
				<div class="w-1/12">
					<InputCheckbox checked={product.checked} />
				</div>
				<p class:font-semibold={product.checked}>{product.name}</p>
			</div>
		{/each}
	</div>

	<small>* champs requis</small>
</ActionConfirm>
