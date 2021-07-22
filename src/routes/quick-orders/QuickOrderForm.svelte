<script>
	import Icon from "svelte-awesome";
	import { onMount, getContext, onDestroy } from "svelte";
	import { faCircleNotch, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import { validators, initialValues } from "./quickOrderForm";
	import SheaftErrors from "../../services/SheaftErrors";
	import { GET_ALL_PRODUCTS } from "./queries";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import form from "../../stores/form";
	import groupBy from "lodash/groupBy";
	import orderBy from "lodash/orderBy";
	import QuickOrderProducts from "./QuickOrderProducts.svelte";
	import Toggle from "../../components/controls/Toggle.svelte";

	export let submit,
		quickOrder = { ...initialValues },
		isInModal = false,
		close = null;

	const errorsHandler = new SheaftErrors();
	const { query, mutate } = getContext("api");
	let isLoading = false;
	let producers = [];

	(() => (quickOrder = form.initialize(quickOrder, validators, initialValues)))();

	const handleSubmit = async () => {
		isLoading = true;
		await form.validateAndSubmit(submit);
		isLoading = false;
	};

	onMount(async () => {
		isLoading = true;

		let res = await query({
			query: GET_ALL_PRODUCTS,
			errorsHandler,
			errorNotification: "Impossible de récupérer vos produits.",
		});

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

		isLoading = false;
	});

	onDestroy(async () => {
		await form.destroy();
	});
</script>

<!-- svelte-ignore component-name-lowercase -->
<form class="w-full" on:submit|preventDefault={handleSubmit}>
	<div class={`mb-6 lg:mb-0 ${!isInModal && "lg:w-1/2"}`}>
		<div class="form-control">
			<div class="w-full">
				<label for="grid-product">Nom *</label>
				<input
					bind:value={quickOrder.name}
					use:bindClass={{ form, name: "name" }}
					class:skeleton-box={isLoading}
					disabled={isLoading}
					name="name"
					id="grid-product"
					type="text"
					placeholder="ex : Commande ULF du lundi"
				/>
				<ErrorContainer field={$form.fields.name} />
			</div>
		</div>
		{#if quickOrder.id}
			<div class="form-control pt-2 items-center">
				<label>Modèle par défaut</label>
				<Toggle
					labelPosition="left"
					disabled={isLoading}
					classNames="ml-1"
					isChecked={quickOrder.isDefault}
					onChange={() => (quickOrder.isDefault = !quickOrder.isDefault)}
				/>
			</div>
		{/if}
		<div class="form-control">
			<div class="w-full">
				<label>Produits *</label>
				<QuickOrderProducts {errorsHandler} {quickOrder} producersProducts={producers} {isLoading} />
			</div>
		</div>
		<div class="form-control mt-4">
			<div class="w-full">
				<label for="grid-description">Description</label>
				<textarea
					bind:value={quickOrder.description}
					use:bindClass={{ form, name: "description" }}
					class:skeleton-box={isLoading}
					disabled={isLoading}
					name="grid-description"
					id="grid-description"
					type="text"
				/>
				<ErrorContainer field={$form.fields.description} />
			</div>
		</div>
	</div>
	<p class="text-sm mt-5">* champs requis</p>
	<div class="form-control mt-5">
		{#if isInModal && close}
			<button
				type="button"
				class:disabled={isLoading}
				on:click={close}
				disabled={isLoading}
				class="btn bg-white shadow btn-lg justify-center w-full md:w-auto lg:mr-2 mr-0 mb-2 lg:mb-0"
			>
				Fermer
			</button>
		{/if}
		<button
			type="submit"
			class:disabled={isLoading || !$form.valid}
			class="btn btn-primary btn-xl justify-center w-full md:w-auto"
		>
			<Icon data={isLoading ? faCircleNotch : faPaperPlane} class="mr-2 inline" spin={isLoading} />
			Valider
		</button>
	</div>
</form>
