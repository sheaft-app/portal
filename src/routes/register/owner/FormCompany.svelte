<script>
	import { bindClass } from "../../../../vendors/svelte-forms/src/index";
	import { slide } from "svelte/transition";
	import ErrorContainer from "./../../../components/ErrorContainer.svelte";
	import CountrySelect from "./../../../components/controls/CountrySelect.svelte";
	import LegalKind from "./../../../enums/LegalKind";
	import Icon from "svelte-awesome";
	import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
	import Cleave from "cleave.js";
	import "cleave.js/dist/addons/cleave-phone.fr";
	import InputCheckbox from "./../../../components/controls/InputCheckbox.svelte";
	import form from "../../../stores/form";
	import { company, stepper, siret, companyValidators, companyInitialValues } from "../registerCompanyForm";

	export let isStore = false,
		errorsHandler = null,
		siretWasNotFound = false;

	let cleave = null;

	$company = form.initialize($company, companyValidators, companyInitialValues);

	const selectKind = (kind) => ($company.kind = kind);

	const next = () => ++$stepper;

	const handleKeydown = (event) => {
		if (event.key == "Enter") {
			event.preventDefault();
			form.validateAndSubmit(next);
		}
	};

	const initializeCleave = () => {
		cleave = new Cleave(".input-phone", {
			phone: true,
			phoneRegionCode: "fr",
		});
	};
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="text-center pb-8 px-5">
	Étape 2/5
	<p class="font-bold text-xl">
		Identifiez votre {isStore ? "magasin" : "entreprise"}
	</p>
</div>
{#if siretWasNotFound}
	<div class="mb-3 p-4 border border-orange-500 text-orange-500 lg:flex flex-row" in:slide>
		<div class="text-center lg:text-left" style="word-break: break-word;">
			<p class="font-semibold">SIRET {$siret} introuvable</p>
			<p class="mt-2">Nous n'avons pas réussi à récupérer les informations pour ce SIRET.</p>
			<p>Si vous êtes sûr que votre SIRET est bien valide, vous pouvez ignorer ce message.</p>
			<button class="btn btn-link mt-2" on:click={() => --$stepper}>Modifier le SIRET</button>
		</div>
	</div>
{/if}
<!-- svelte-ignore component-name-lowercase -->
<form>
	<fieldset>
		<div class="flex flex-wrap w-full shadow lg:rounded mb-5">
			<div class="px-5 py-3 bg-white lg:w-6/12 w-full">
				<div
					class="-my-3 -mx-5 px-5 py-3 mb-4 bg-gray-100 border-b border-gray-400 lg:rounded-t font-semibold flex justify-between items-center"
				>
					<p>Infos générales</p>
				</div>
				<div class="w-full form-control">
					<label for="grid-kind">Forme juridique *</label>
					<div class="w-full text-xs justify-center button-group" use:bindClass={{ form, name: "kind" }}>
						<button
							on:click={() => selectKind(LegalKind.Organization.Value)}
							type="button"
							class:selected={$company.kind === LegalKind.Organization.Value}
						>
							{LegalKind.Organization.Label}
						</button>
						<button
							on:click={() => selectKind(LegalKind.Business.Value)}
							type="button"
							class:selected={$company.kind === LegalKind.Business.Value}
						>
							{LegalKind.Business.Label}
						</button>
						<button
							on:click={() => selectKind(LegalKind.Individual.Value)}
							type="button"
							class:selected={$company.kind === LegalKind.Individual.Value}
						>
							{LegalKind.Individual.Label}
						</button>
					</div>
				</div>
				<ErrorContainer field={$form.fields.kind} />
				<div class="w-full form-control">
					<label for="$company_legalName">Raison sociale *</label>
					<input
						id="$company_legalName"
						type="text"
						placeholder="ex : G.A.E.C des balmettes"
						use:bindClass={{ form, name: "legalName" }}
						bind:value={$company.name}
					/>
					<ErrorContainer field={$form.fields.legalName} />
				</div>
				<div class="w-full mb-2 md:mb-0 form-control">
					<label for="name">
						Nom commercial {isStore ? "du magasin" : "de l'entreprise"} *
					</label>
					<input
						id="name"
						type="text"
						placeholder="ex : La ferme des balmettes"
						use:bindClass={{ form, name: "commercialName" }}
						bind:value={$company.commercialName}
					/>
					<ErrorContainer field={$form.fields.commercialName} />
				</div>
				{#if !isStore}
					<div class="mt-2 mb-2">
						<label class="cursor-pointer">
							<InputCheckbox
								checked={$company.notSubjectToVat}
								onClick={() => ($company.notSubjectToVat = !$company.notSubjectToVat)}
							/>
							Mon entreprise n'est pas assujettie à la TVA
						</label>
					</div>
				{/if}
				{#if !$company.notSubjectToVat}
					<div class="w-full form-control">
						<label for="vat">N° de TVA *</label>
						<div class="flex flex-wrap" use:bindClass={{ form, name: "vatIdentifier" }}>
							<input id="vat" type="text" disabled={true} value="FR" class="w-3/12 disabled" />
							<input
								id="vat"
								type="text"
								maxlength="2"
								minlength="2"
								bind:value={$company.vatIdentifier}
								class="w-3/12"
							/>
							<input
								id="vat-siret"
								type="text"
								disabled={true}
								value={$siret ? $siret.toString().substring(0, 9).toUpperCase() : 0}
								class="w-6/12 disabled"
							/>
						</div>
						<ErrorContainer field={$form.fields.vatIdentifier} />
					</div>
				{/if}
				<div class="w-full form-control">
					<label for="$company_email">Email de contact *</label>
					<input id="$company_email" type="email" use:bindClass={{ form, name: "email" }} bind:value={$company.email} />
					<ErrorContainer field={$form.fields.email} />
				</div>
				<div class="w-full form-control">
					<label for="$company_email">Téléphone *</label>
					<input
						id="$company_phone"
						class="input-phone"
						use:initializeCleave
						use:bindClass={{ form, name: "phone" }}
						bind:value={$company.phone}
					/>
					<ErrorContainer field={$form.fields.phone} />
				</div>
				<small class="text-gray-600"
					><Icon data={faInfoCircle} scale="0.8" class="mr-2" />Seuls l'équipe Sheaft et les clients ayant commandé
					auprès de vous peuvent voir votre mail et votre téléphone.</small
				>
			</div>
			<div class="px-5 py-3 bg-white lg:w-6/12 w-full">
				<div
					class="-my-3 -mx-5 px-5 py-3 mb-4 bg-gray-100 border-b border-gray-400 lg:rounded-t font-semibold flex justify-between items-center"
				>
					<p>Siège social</p>
				</div>
				<div class="w-full form-control">
					<label for="line1">Adresse *</label>
					<input
						name="line1"
						placeholder="ex : 210 Avenue de la Liberté"
						use:bindClass={{ form, name: "line1" }}
						bind:value={$company.address.line1}
						autocomplete="address-line1"
					/>
					<ErrorContainer field={$form.fields.line1} />
				</div>
				<div class="w-full form-control">
					<label for="line2">Complément d'adresse</label>
					<input
						name="line2"
						placeholder="ex : Appartement 15"
						bind:value={$company.address.line2}
						autocomplete="address-line2"
					/>
				</div>
				<div class="form-control">
					<div class="flex flex-wrap lg:flex-row lg:flex-no-wrap w-full">
						<div class="w-full pr-0 lg:pr-2">
							<label for="postcode">Code postal *</label>
							<input
								name="postcode"
								placeholder="ex : 74000"
								bind:value={$company.address.zipcode}
								use:bindClass={{ form, name: "zipcode" }}
								autocomplete="postal-code"
							/>
							<ErrorContainer field={$form.fields.zipcode} />
						</div>
						<div class="w-full">
							<label for="city">Ville *</label>
							<input
								name="city"
								placeholder="ex : Annecy"
								bind:value={$company.address.city}
								use:bindClass={{ form, name: "city" }}
								autocomplete="address-level2"
							/>
							<ErrorContainer field={$form.fields.city} />
						</div>
					</div>
				</div>
				<div class="w-full form-control" style="display: block">
					<label for="country">Pays *</label>
					<CountrySelect bind:selectedValue={$company.address.country} formName={form} name="country" {errorsHandler} />
				</div>
			</div>
		</div>
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
			on:click={() => form.validateAndSubmit(next)}
			aria-label="Suivant"
			class:disabled={!$form.valid}
			class="form-button uppercase text-sm cursor-pointer text-white
        shadow rounded-full px-6 py-2 flex items-center justify-center
        m-auto bg-primary"
		>
			Suivant
		</button>
	</div>
</div>

<style>
	.form-button {
		width: 125px;
	}
	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type="number"] {
		-moz-appearance: textfield;
	}
</style>
