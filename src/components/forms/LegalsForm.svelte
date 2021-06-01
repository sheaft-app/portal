<script>
	import { getContext, onMount } from "svelte";
	import { slide } from "svelte/transition";
	import Loader from "../../components/Loader.svelte";
	import { form, bindClass } from "../../../vendors/svelte-forms/src/index";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import Cleave from "cleave.js";
	import { GET_COUNTRIES, GET_NATIONALITIES } from "../queries";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import CountrySelect from "./../../components/controls/CountrySelect.svelte";
	import NationalitySelect from "./../../components/controls/NationalitySelect.svelte";

	export let user = {
			id: null,
			firstName: null,
			lastName: null,
			birthDate: null,
			nationality: null,
			email: null,
			countryOfResidence: null,
			address: {
				line1: null,
				line2: null,
				zipcode: null,
				city: null,
				country: null,
			},
		},
		invalid = false,
		errorsHandler = null,
		canFlex = false,
		hideResidence = false,
		facturationForm = null,
		accordeon = false,
		selectedAccordeon = null,
		validatedInfoOnce = false;

	const { query } = getContext("api");

	let isLoadingLists = true;
	let cleave = null;

	facturationForm = form(
		() => ({
			firstName: { value: user.firstName, validators: ["required"], enabled: true },
			lastName: { value: user.lastName, validators: ["required"], enabled: true },
			birthDate: { value: user.birthDate, validators: ["required"], enabled: true },
			nationality: { value: user.nationality, validators: ["required"], enabled: true },
			email: { value: user.email, validators: ["required", "email"], enabled: true },
			countryOfResidence: { value: user.countryOfResidence, validators: ["required"], enabled: !hideResidence },
			line1: { value: user.address.line1, validators: ["required"], enabled: true },
			city: { value: user.address.city, validators: ["required"], enabled: true },
			zipcode: { value: user.address.zipcode, validators: ["required"], enabled: true },
			country: { value: user.address.country, validators: ["required"], enabled: true },
		}),
		{
			initCheck: false,
		}
	);

	onMount(async () => {
		await query({
			query: GET_COUNTRIES,
			errorsHandler,
			success: (res) => {
				if (user.countryOfResidence && typeof user.address.country == "string")
					user.countryOfResidence = res.data.find((c) => c.code == user.countryOfResidence);
				if (user.address.country && typeof user.address.country == "string")
					user.address.country = res.data.find((c) => c.code == user.address.country);
			},
			errorNotification: "Impossible de récupérer la liste des pays",
		});

		await query({
			query: GET_NATIONALITIES,
			errorsHandler,
			success: (res) => {
				if (user.nationality && typeof user.nationality == "string")
					user.nationality = res.data.find((c) => c.code == user.nationality);
			},
			errorNotification: "Impossible de récupérer la liste des nationalités",
		});
		isLoadingLists = false;

		// restaurer les valeurs initiales quand elles viennent du serveur sous format ISOCode

		if (user.birthDate) {
			if (typeof user.birthDate == "object" || user.birthDate.includes("-")) {
				user.birthDate = format(new Date(user.birthDate), "P", { locale: fr });
			} else {
				const dateParts = user.birthDate.trim().split("/");
				user.birthDate = format(new Date(dateParts[2], dateParts[1] - 1, dateParts[0]), "P", { locale: fr });
			}
		}
	});

	const initializeCleave = () => {
		cleave = new Cleave(".input-birthday", {
			date: true,
			delimiter: " / ",
			datePattern: ["d", "m", "Y"],
		});
	};

	$: invalid = !$facturationForm.valid;

</script>

<slot name="header" />

{#if isLoadingLists}
	<Loader />
{:else}
	<div class="flex flex-wrap w-full shadow lg:rounded {accordeon ? '' : 'mb-5'}">
		<div class="px-5 py-3 bg-white {canFlex ? 'lg:w-6/12' : ''} w-full {accordeon ? '' : 'mb-5 lg:mb-0'}">
			<slot name="basics-header" />
			{#if !accordeon || (accordeon && selectedAccordeon == "info")}
				<div transition:slide|local>
					<div class="form-control">
						<div class="flex flex-wrap lg:flex-row w-full">
							<div class="lg:w-1/2 w-full pr-0 md:pr-2 mb-3 lg:mb-0">
								<label for="firstName">Prénom *</label>
								<input
									name="firstName"
									placeholder="ex : Jean"
									bind:value={user.firstName}
									use:bindClass={{ form: facturationForm, name: "firstName" }}
									autocomplete="given-name"
								/>
								<ErrorContainer field={$facturationForm.fields.firstName} />
							</div>
							<div class="lg:w-1/2 w-full">
								<label for="lastName">Nom de famille *</label>
								<input
									name="lastName"
									placeholder="ex : Dupont"
									bind:value={user.lastName}
									use:bindClass={{ form: facturationForm, name: "lastName" }}
									autocomplete="family-name"
								/>
								<ErrorContainer field={$facturationForm.fields.lastName} />
							</div>
						</div>
					</div>

					<div class="w-full form-control">
						<label for="email">E-mail *</label>
						<input
							name="email"
							placeholder="ex : jean.dupont@gmail.com"
							type="email"
							use:bindClass={{ form: facturationForm, name: "email" }}
							bind:value={user.email}
							autocomplete="email"
						/>
						<ErrorContainer field={$facturationForm.fields.email} />
					</div>

					<div class="w-full form-control">
						<label for="birthday">Date de naissance (JJ/MM/AAAA)*</label>
						<input
							name="birthday"
							use:initializeCleave
							class="input-birthday"
							placeholder="JJ/MM/AAAA"
							type="text"
							use:bindClass={{ form: facturationForm, name: "birthDate" }}
							bind:value={user.birthDate}
							autocomplete="birthday"
						/>
						<ErrorContainer field={$facturationForm.fields.birthDate} />
					</div>

					{#if !hideResidence}
						<div class="w-full form-control" style="display: block">
							<label for="country">Pays de résidence *</label>
							<CountrySelect
								bind:selectedValue={user.countryOfResidence}
								formName={facturationForm}
								name="countryOfResidence"
								{errorsHandler}
							/>
						</div>
					{/if}

					<div class="w-full form-control" style="display: block">
						<label for="nationality">Nationalité *</label>
						<NationalitySelect
							bind:selectedValue={user.nationality}
							formName={facturationForm}
							name="nationality"
							{errorsHandler}
						/>
					</div>

					{#if accordeon && facturationForm && !validatedInfoOnce}
						<button
							on:click={() => {
								validatedInfoOnce = true;
								selectedAccordeon = "address";
							}}
							disabled={!$facturationForm.fields.firstName.valid ||
								!$facturationForm.fields.lastName.valid ||
								!$facturationForm.fields.email.valid ||
								!$facturationForm.fields.birthDate.valid ||
								!$facturationForm.fields.countryOfResidence.valid ||
								!$facturationForm.fields.nationality.valid}
							class:disabled={!$facturationForm.fields.firstName.valid ||
								!$facturationForm.fields.lastName.valid ||
								!$facturationForm.fields.email.valid ||
								!$facturationForm.fields.birthDate.valid ||
								!$facturationForm.fields.countryOfResidence.valid ||
								!$facturationForm.fields.nationality.valid}
							class="btn btn-accent btn-lg">Valider</button
						>
					{/if}
				</div>
			{/if}
		</div>

		<div class="px-5 py-3 bg-white {canFlex ? 'lg:w-6/12' : ''} w-full">
			<slot name="address-header" />
			{#if !accordeon || (accordeon && selectedAccordeon == "address")}
				<div transition:slide|local>
					<div class="w-full form-control">
						<label for="line1">Adresse *</label>
						<input
							name="line1"
							placeholder="ex : 210 Avenue de la Liberté"
							use:bindClass={{ form: facturationForm, name: "line1" }}
							bind:value={user.address.line1}
							autocomplete="address-line1"
						/>
						<ErrorContainer field={$facturationForm.fields.line1} />
					</div>
					<div class="w-full form-control">
						<label for="line2">Complément d'adresse</label>
						<input
							name="line2"
							placeholder="ex : Appartement 15"
							bind:value={user.address.line2}
							autocomplete="address-line2"
						/>
					</div>

					<div class="form-control">
						<div class="flex flex-wrap lg:flex-row w-full">
							<div class="lg:w-1/2 w-full pr-0 lg:pr-2 mb-3 lg:mb-0">
								<label for="postcode">Code postal *</label>
								<input
									name="postcode"
									placeholder="ex : 74000"
									bind:value={user.address.zipcode}
									use:bindClass={{ form: facturationForm, name: "zipcode" }}
									autocomplete="postal-code"
								/>
								<ErrorContainer field={$facturationForm.fields.zipcode} />
							</div>
							<div class="lg:w-1/2 w-full ">
								<label for="city">Ville *</label>
								<input
									name="city"
									placeholder="ex : Annecy"
									bind:value={user.address.city}
									use:bindClass={{ form: facturationForm, name: "city" }}
									autocomplete="address-level2"
								/>
								<ErrorContainer field={$facturationForm.fields.city} />
							</div>
						</div>
					</div>

					<div class="w-full form-control" style="display: block">
						<label for="country">Pays *</label>
						<CountrySelect
							bind:selectedValue={user.address.country}
							formName={facturationForm}
							name="country"
							{errorsHandler}
						/>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}
