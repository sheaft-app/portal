<script>
	import CitySearch from "./../../../components/search/CitySearch.svelte";
	import ErrorContainer from "./../../../components/ErrorContainer.svelte";
	import InputCheckbox from "./../../../components/controls/InputCheckbox.svelte";
	import Loader from "./../../../components/Loader.svelte";
	import Icon from "svelte-awesome";
	import { businessHours, openForBusiness, stepper, productionSite } from "../registerCompanyForm";
	import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

	export let isStore;

	let isSearchingAddress = false;
	let address = null;

	const resetAddress = () => {
		$productionSite.address = {
			line1: null,
			line2: null,
			city: null,
			zipcode: null,
		};
	};

	const handleKeydown = (event) => {
		if (event.key == "Enter") {
			event.preventDefault();
			submit();
		}
	};

	$:{
		if(address)
			$productionSite.address = address;
	}

	$: valid =
		$productionSite.address.line1 &&
		$productionSite.address.city &&
		$productionSite.address.zipcode;
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="text-center pb-8 px-5">
	Étape {$stepper + 1}/5
	<p class="font-bold text-lg">
		Renseignez à présent l'adresse de votre {isStore ? "magasin" : "lieu de production"}
	</p>
	{#if !isStore}
		<p class="text-gray-600 mt-1">
			Cette adresse sera visible publiquement. Elle doit représenter votre lieu de production principal.
		</p>
	{/if}
</div>
{#if isSearchingAddress}
	<div class="w-full h-full md:w-1/2 mb-2 md:mb-0 px-8">
		<Loader />
	</div>
{:else if $productionSite.address.line1 && $productionSite.address.city && $productionSite.address.zipcode}
	<form class="px-8">
		<fieldset>
			<div class="form-control">
				<label for="line1">Adresse*</label>
				<input
					id="line1"
					type="text"
					required="required"
					class="disabled"
					disabled={true}
					bind:value={$productionSite.address.line1}
				/>
			</div>
			<div class="form-control">
				<label for="line2">Complément d'adresse</label>
				<input id="line2" type="text" bind:value={$productionSite.address.line2} />
			</div>
			<div class="flex">
				<div class="w-full form-control pr-2">
					<label for="zipcode">Code postal*</label>
					<input
						id="zipcode"
						type="text"
						required="required"
						maxlength="5"
						class="disabled"
						disabled={true}
						bind:value={$productionSite.address.zipcode}
					/>
				</div>
				<div class="w-full md:w-1/2 form-control">
					<label for="city">Ville*</label>
					<input
						id="city"
						type="text"
						required="required"
						class="disabled"
						disabled={true}
						bind:value={$productionSite.address.city}
					/>
				</div>
			</div>
			<p class="mt-2">
				<button class="btn-link" on:click={resetAddress}> Modifier l'adresse </button>
			</p>
		</fieldset>
	</form>
{:else}
	<div class="px-8">
		<div class="w-full form-control" style="display: block;">
			<CitySearch
				bind:selectedAddress={address}
				placeholder="{`Entrez l'adresse de votre ${ (isStore ? "magasin" : "lieu de production")}`}"
			/>
		</div>
		<small class="text-gray-600"
			><Icon data={faInfoCircle} scale="0.8" class="mr-2" />Tapez une adresse puis sélectionnez la correspondance
			dans la liste.</small
		>
	</div>
{/if}

<div class="flex w-full justify-center mt-5">
	<div>
		<button
			on:click={() => $stepper--}
			aria-label="Retour"
			class="form-button uppercase text-sm cursor-pointer text-gray-600
      rounded-full px-6 py-2 flex items-center justify-center m-auto border border-gray-600 mr-2"
		>
			Précédent
		</button>
	</div>
	<div>
		<button
			on:click={() => $stepper++}
			aria-label="Suivant"
			disabled={!valid}
			class:disabled={!valid}
			class="form-button uppercase text-sm cursor-pointer text-white
      shadow rounded-full px-6 py-2 flex items-center justify-center
      m-auto bg-primary"
		>
			Suivant
		</button>
	</div>
</div>
