<script>
	import { UPDATE_STORE } from "./mutations.js";
	import { GET_STORE_DETAILS } from "./queries.js";
	import { slide } from "svelte/transition";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
  import CitySearch from "./../../components/search/CitySearch.svelte";
  import OpeningHoursContainer from "./../../components/opening-hours/OpeningHoursContainer.svelte";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import Toggle from "./../../components/controls/Toggle.svelte";
	import ProfileForm from "./ProfileForm.svelte";

	export let errorsHandler, userId;

	let store = {
		firstName: null,
		lastName: null,
		email: null,
		phone: null,
		address: {
			line1: null,
			line2: null,
			city: null,
			zipcode: null,
			country: "FR"
		},
		description: null,
		openingHours: [],
		openForNewBusiness: false
	};
	
	const storeForm = form(() => ({
    firstName: { value: store.firstName, validators: ['required'], enabled: true },
    lastName: { value: store.lastName, validators: ['required'], enabled: true },
    email: { value: store.email, validators: ['required', 'email'], enabled: true },
		address: { value: store.address, validators: ['required'], enabled: true },
    openingHours: { value: store.openingHours, validators: ['required', 'openingsDays', 'openingsDates'], enabled: store.openForNewBusiness }
	}), {
    initCheck: false
	});
</script>

<ProfileForm
	bind:user={store}
	form={storeForm}
	updateQuery={UPDATE_STORE}
	getQuery={GET_STORE_DETAILS}
	{errorsHandler}
	{userId}>
	<h3 class="font-semibold uppercase mb-0 mt-5">{store.name || "Votre société"}</h3>
	<span class="bg-primary h-1 w-20 mt-2 mb-6 block"></span>
	<input hidden required name="city" bind:value={store.address.city} />
	<input
		hidden
		required
		name="zipcode"
		bind:value={store.address.zipcode} />
	<input hidden required name="line1" bind:value={store.address.line1} />
	<input
		hidden
		required
		name="latitude"
		bind:value={store.address.latitude} />
	<input
		hidden
		required
		name="longitude"
		bind:value={store.address.longitude} />
	<div class="form-control" style="display: block;">
		<label for="grid-line1">Adresse du magasin *</label>
		<CitySearch bind:selectedAddress={store.address} />
	</div>
	<div class="form-control">
		<div class="w-full md:w-2/2">
			<label for="grid-line2">Complément d'adresse</label>
			<input
				bind:value={store.address.line2}
				id="grid-line"
				type="text"
				placeholder="Bâtiment B n°113" />
		</div>
	</div>
	<div class="form-control">
		<div class="w-full md:w-2/2">
			<label for="grid-line2">Description</label>
			<textarea
				bind:value={store.description}
				id="grid-line"
				type="text"
				placeholder="Cette description sera visible par tous les producteurs (optionnel)" />
		</div>
	</div>
	<div class="mt-4">
		<Toggle classNames="ml-1" bind:isChecked={store.openForNewBusiness}>
			<div class="ml-2">
					<span class="ml-1">Je veux être visible des producteurs à proximité pour qu'ils puissent me proposer des partenariats</span>
			</div>
		</Toggle>
	</div>
	{#if store.openForNewBusiness}
		<div class="form-control mt-2" transition:slide|local>
			<div class="w-full" use:bindClass={{ form: storeForm, name: "openingHours" }}>
				<label for="grid-timestamp">Horaires d'ouverture *</label>
				<OpeningHoursContainer bind:openings={store.openingHours} />
				<ErrorContainer field={$storeForm.fields.openingHours} />
			</div>
		</div>
	{/if}
</ProfileForm>