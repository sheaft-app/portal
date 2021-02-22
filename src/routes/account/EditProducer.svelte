<script>
	import { UPDATE_PRODUCER } from "./mutations.js";
	import { GET_PRODUCER_DETAILS } from "./queries.js";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
  	import CitySearch from "./../../components/search/CitySearch.svelte";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import Toggle from "./../../components/controls/Toggle.svelte";
	import ProfileForm from "./ProfileForm.svelte";

	export let errorsHandler, userId;

	let producer = {
		name: null,
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
		}
	};
	
	const producerForm = form(() => ({
    name: { value: producer.name, validators: ['required'], enabled: true },
    firstName: { value: producer.firstName, validators: ['required'], enabled: true },
    lastName: { value: producer.lastName, validators: ['required'], enabled: true },
		email: { value: producer.email, validators: ['required', 'email'], enabled: true },
		address: { value: producer.address, validators: ['required'], enabled: true }
	}), {
    initCheck: false
	});
</script>

<ProfileForm
	bind:user={producer}
	form={producerForm}
	updateQuery={UPDATE_PRODUCER}
	getQuery={GET_PRODUCER_DETAILS}
	{errorsHandler}
	{userId}>
	<h3 class="font-semibold uppercase mb-0 mt-5">Votre entreprise</h3>
	<span class="bg-primary h-1 w-20 mt-2 mb-6 block"></span>	
	<div class="form-control">
		<div class="w-full md:w-2/2">
			<label for="grid-line2">Nom commercial *</label>
			<input
				bind:value={producer.name}
				id="grid-line"
				type="text"
				placeholder="Nom commercial de votre entreprise" />
		</div>
	</div>
	<input hidden required name="city" bind:value={producer.address.city} />
	<input
		hidden
		required
		name="zipcode"
		bind:value={producer.address.zipcode} />
	<input hidden required name="line1" bind:value={producer.address.line1} />
	<input
		hidden
		required
		name="latitude"
		bind:value={producer.address.latitude} />
	<input
		hidden
		required
		name="longitude"
		bind:value={producer.address.longitude} />
	<div class="form-control" style="display: block;">
		<label for="grid-line1">Adresse du lieu de production *</label>
		<CitySearch bind:selectedAddress={producer.address} />
	</div>
	<div class="form-control">
		<div class="w-full md:w-2/2">
			<label for="grid-line2">Complément d'adresse</label>
			<input
				bind:value={producer.address.line2}
				id="grid-line"
				type="text"
				placeholder="Bâtiment B n°113" />
		</div>
	</div>
	<div class="mt-4">
		<Toggle classNames="ml-1" bind:isChecked={producer.openForNewBusiness}>
			<div class="ml-2">
					<span class="ml-1">Je veux être visible des commerces à proximité pour qu'ils puissent me proposer des partenariats</span>
			</div>
		</Toggle>
	</div>
</ProfileForm>