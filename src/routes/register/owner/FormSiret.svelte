<script>
	import InputSiret from "../InputSiret.svelte";
	import GetRouterInstance from "./../../../services/SheaftRouter";
	import { SEARCH_COMPANY_SIRET } from "../queries.js";
	import Icon from "svelte-awesome";
	import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import form from "../../../stores/form";
	import { siret, company, stepper } from "../registerCompanyForm";
	import { getContext } from "svelte";

	export let siretWasNotFound = false,
		errorsHandler;

	const { query } = getContext("api");
	const routerInstance = GetRouterInstance();

	let isSearchingSiret = false;

	const validateSiret = async () => {
		siretWasNotFound = false;

		if ($siret.length < 14 || $siret.length > 14) return;

		isSearchingSiret = true;
		await query({
			query: SEARCH_COMPANY_SIRET,
			variables: { input: `${$siret}` },
			errorsHandler,
			success: (res) => {
				$company.address = res.address;
				$company.kind = res.kind;
				$company.name = res.name;
				$company.firstName = $company.firstName ?? res.firstName;
				$company.lastName = $company.lastName ?? res.lastName;
				$company.vatIdentifier = res.owner.vatNumber ? res.owner.vatNumber.substr(2, 2) : null;
			},
			error: () => (siretWasNotFound = true),
			errorNotification: "Impossible de trouver des informations pour ce SIRET",
		});

		isSearchingSiret = false;
		$stepper++;
	};

	const handleKeydown = (event) => {
		if (event.key == "Enter") {
			event.preventDefault();
			validateSiret();
		}
	};

	const cancel = () => {
		localStorage.removeItem("user_choosen_role");
		routerInstance.goBack();
	};

	$: isValid = $siret && $siret.toString().length == 14;
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="text-center pb-8 px-5">
	Étape 1/5
	<p class="font-bold text-xl">Commençons par votre SIRET</p>
	<p class="text-gray-600">Grâce à votre SIRET, nous pourrons charger certaines informations de base.</p>
</div>
<form on:submit|preventDefault={() => {}}>
	<fieldset>
		<div class="flex">
			<div class="form-control w-full">
				<InputSiret
					disabled={isSearchingSiret}
					bind:value={$siret}
					bindClassData={{ form, name: "siret" }}
					placeholder="SIRET (14 chiffres)"
				/>
			</div>
		</div>
	</fieldset>
	<div class="flex w-full justify-center mt-5">
		<div>
			<button
				on:click={() => cancel()}
				aria-label="Retour"
				class="form-button uppercase text-sm cursor-pointer rounded-full
        px-6 py-2 flex items-center justify-center m-auto border border-gray-600 mr-2"
			>
				Retour
			</button>
		</div>
		<div>
			<button
				class:disabled={isSearchingSiret || !isValid}
				on:click={() => validateSiret()}
				aria-label="Suivant"
				disabled={isSearchingSiret || !isValid}
				class="form-button uppercase text-sm cursor-pointer text-white
        shadow rounded-full px-6 py-2 flex items-center justify-center
        m-auto bg-primary"
			>
				Suivant
				{#if isSearchingSiret}
					<Icon data={faCircleNotch} spin class="ml-2" />
				{/if}
			</button>
		</div>
	</div>
</form>
