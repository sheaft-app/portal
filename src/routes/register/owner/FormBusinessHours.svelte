<script>
	import Toggle from "./../../../components/controls/Toggle.svelte";
	import OpeningHoursContainer from "./../../../components/opening-hours/OpeningHoursContainer.svelte";
	import { businessHours, openForBusiness, stepper, productionSite } from "../registerCompanyForm";
	import InputCheckbox from "./../../../components/controls/InputCheckbox.svelte";
	import {config} from "./../../../configs/config";

	export let isStore = false,
		submit = () => {};

	let acceptCgv = false;
	let acceptMangoCgv = isStore;

	const handleKeydown = (event) => {
		if (event.key == "Enter") {
			event.preventDefault();
			$stepper++;
		}
	};

	const sendForm = async () => {
		if(!valid)
			return;

		await submit();
	}

	$: valid = acceptCgv && acceptMangoCgv;
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="text-center pb-8 px-5">
	Étape finale
	<p class="font-bold text-lg">
		Visibilité de votre {isStore ? "magasin" : "entreprise"}
	</p>
</div>
<form>
	<fieldset>
		<div class="w-full mb-2 md:mb-0 px-5">
			<p class="text-gray-600">
				Votre {isStore ? "magasin" : "entreprise"} peut être visible des {isStore ? "producteurs" : "magasins"}. Un module dédié vous
				permet de les trouver et leur permettent de vous trouver.
			</p>
			<p class="text-gray-600">Activez cette option si vous souhaitez pouvoir commercer avec eux.</p>
			<div class="mt-10 mb-4">
				<Toggle classNames="ml-1 justify-center" bind:isChecked={$openForBusiness}>
					<span class="ml-1">
						Je veux être visible des {isStore ? "producteurs" : "magasins"}
						pour commercer avec eux.
					</span>
				</Toggle>
			</div>
		</div>
		{#if $openForBusiness && isStore}
			<div class="form-control mt-10">
				<label style="margin: 0 !important;"> Horaires d'ouverture * </label>
				<p class="text-sm">
					Renseignez vos horaires d'ouverture pour qu'un producteur évite de vous contacter si vos horaires ne
					correspondent pas à ses plages de livraison.
				</p>
			</div>
			<OpeningHoursContainer bind:openings={$businessHours} />
		{/if}

		<div class="mt-10">
			<label class="cursor-pointer">
				<InputCheckbox checked={acceptCgv} onClick={() => (acceptCgv = !acceptCgv)} />
				Je reconnais avoir lu et compris
				<a href="https://www.sheaft.com/legals-pro" target="_blank">
					les conditions générales de vente et d'utilisation
				</a>
				et je les accepte
			</label>
		</div>
		{#if !isStore}
			<div class="mt-2">
				<label class="cursor-pointer">
					<InputCheckbox checked={acceptMangoCgv} onClick={() => (acceptMangoCgv = !acceptMangoCgv)} />
					Je reconnais avoir lu et compris
					<a href={config.content + "/resources/legals/Mangopay_Terms-FR.pdf"} target="_blank">
						les conditions générales d'utilisation de services de paiement de MangoPay,
					</a>
					notre tiers de paiement, et je les accepte
				</label>
			</div>
		{/if}
	</fieldset>
</form>
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
			on:click={() => sendForm()}
			aria-label="Terminer"
			disabled={!valid}
			class:disabled={!valid}
			class="form-button uppercase text-sm cursor-pointer text-white
      shadow rounded-full px-6 py-2 flex items-center justify-center
      m-auto bg-primary"
		>
			Terminer
		</button>
	</div>
</div>
