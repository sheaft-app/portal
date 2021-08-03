<script>
	import LegalsForm from "../../components/forms/LegalsForm.svelte";
	import Icon from "svelte-awesome";
	import { faChevronLeft, faEdit } from "@fortawesome/free-solid-svg-icons";
	import GetRouterInstance from "../../services/SheaftRouter";
	import CartRoutes from "./routes";

	export let user,
		errorsHandler = null,
		invalid = false;

	const routerInstance = GetRouterInstance();

	let selectedAccordeon = "info";
	let validatedInfoOnce = false;
</script>

<LegalsForm
	bind:validatedInfoOnce
	bind:user
	{errorsHandler}
	accordeon={true}
	bind:selectedAccordeon
	bind:invalid
	canFlex={false}
>
	<section slot="header" class="mb-4 pb-4 pt-3 lg:pt-2 px-5 lg:px-0">
		<div class="mb-3">
			<button
				class="text-gray-600 items-center flex uppercase"
				on:click={() => routerInstance.goTo(CartRoutes.Resume)}
			>
				<Icon data={faChevronLeft} class="mr-2 inline" />
				Aller au panier
			</button>
		</div>
		<h1 class="font-semibold uppercase mb-0">Informations de facturation</h1>
		<span class="bg-primary h-1 w-20 block mt-2" />
		<p class="text-gray-600 mt-2">
			Ces informations ne vous seront demandées que pour la première commande. Elles permettent d'authentifier vos
			transactions.
		</p>
	</section>
	<div
		slot="basics-header"
		class:mb-4={selectedAccordeon == "info"}
		class="-my-3 -mx-5 px-5 py-3 bg-gray-100 border-b border-gray-400 lg:rounded-t font-semibold flex justify-between items-start"
	>
		<div class="w-full">
			<p>Infos générales</p>
			{#if selectedAccordeon == "address"}
				{#if user.firstName && user.lastName && user.firstName && user.email && user.birthDate && user.countryOfResidence && user.nationality}
					<div class="flex flex-wrap justify-between w-full text-sm font-normal">
						<div class="w-full xl:w-1/2">
							<p>{user.firstName} {user.lastName}</p>
							<p>{user.email}</p>
							<p>né le {user.birthDate}</p>
						</div>
						<div class="w-full xl:w-1/2">
							<p>
								Résidence : {user.countryOfResidence.name
									? user.countryOfResidence.name
									: user.countryOfResidence}
							</p>
							<p>Nationalité : {user.nationality.name ? user.nationality.name : user.nationality}</p>
						</div>
					</div>
				{:else}
					<p class="text-red-500 text-sm uppercase">Incomplet</p>
				{/if}
			{/if}
		</div>
		{#if selectedAccordeon == "address"}
			<button
				class="btn btn-link items-center"
				on:click={() => {
					selectedAccordeon = "info";
				}}
			>
				<Icon data={faEdit} class="mr-1" />
				<span>Modifier</span>
			</button>
		{/if}
	</div>
	<div
		slot="address-header"
		class:mb-4={selectedAccordeon == "address"}
		class="-my-3 -mx-5 px-5 py-3 bg-gray-100 border-b border-gray-400 lg:rounded-t font-semibold flex justify-between items-start"
	>
		<div class="w-full">
			<p>Adresse</p>
			{#if selectedAccordeon == "info"}
				{#if user.address.line1 && user.address.zipcode && user.address.city && user.address.country}
					<div class="text-sm font-normal">
						<p>{user.address.line1}</p>
						{#if user.address.line2}
							<p>{user.address.line2}</p>
						{/if}
						<p>{user.address.zipcode} {user.address.city}</p>
						<p>{user.address.country.name ? user.address.country.name : user.address.country}</p>
					</div>
				{:else if validatedInfoOnce}
					<p class="text-red-500 text-sm uppercase">Incomplet</p>
				{/if}
			{/if}
		</div>
		{#if selectedAccordeon == "info" && validatedInfoOnce}
			<button
				class="btn btn-link items-center"
				on:click={() => {
					selectedAccordeon = "address";
				}}
			>
				<Icon data={faEdit} class="mr-1" />
				<span>Modifier</span>
			</button>
		{/if}
	</div>
</LegalsForm>
