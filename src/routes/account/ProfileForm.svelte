<script>
	import { getContext, onMount, onDestroy } from "svelte";
	import GetAuthInstance from "./../../services/SheaftAuth.js";
	import Icon from "svelte-awesome";
	import { faCircleNotch, faCheck } from "@fortawesome/free-solid-svg-icons";
	import { bindClass } from "../../../vendors/svelte-forms/src/index";
	import ErrorContainer from "./../../components/ErrorContainer.svelte";
	import { denormalizeOpeningHours } from "./../../helpers/app";
	import Cleave from "cleave.js";
	import "cleave.js/dist/addons/cleave-phone.fr";
	import { loginFreshdesk } from "./../../services/SheaftFreshdesk";
	import form from "../../stores/form";

	export let user,
		updateQuery,
		getQuery,
		errorsHandler,
		isLoading = true;
	export let validators, initialValues, normalizer;

	const { query, mutate } = getContext("api");
	const authInstance = GetAuthInstance();

	$: if (!isLoading && !$form.hasInitialized) {
		user = form.initialize(user, validators, initialValues);
	}

	onDestroy(async () => {
		await form.destroy();
	});

	let cleave = null;

	const handleUpdate = async () => {
		await mutate({
			mutation: updateQuery,
			variables: normalizer(user),
			errorsHandler,
			success: async () => {
				await authInstance.refreshLogin();
				await loginFreshdesk();
			},
			successNotification: "Vos modifications ont bien été appliquées",
			errorNotification: "Impossible de mettre à jour vos informations. Veuillez réessayer ultérieurement",
		});
	};

	const initializeCleave = () => {
		cleave = new Cleave(".input-phone", {
			phone: true,
			phoneRegionCode: "fr",
		});
	};

	onMount(async () => {
		isLoading = true;
		await query({
			query: getQuery,
			errorsHandler,
			success: async (res) => {
				user = res;
				if (res.openingHours && res.openingHours.length > 0) {
					user.openingHours = denormalizeOpeningHours(res.openingHours);
				}
			},
			errorNotification: "Impossible de récupérer vos informations. Veuillez réessayer ultérieurement",
		});
		isLoading = false;
	});
</script>

<div class="bg-white shadow px-5 py-3">
	<form class="w-full" on:submit|preventDefault={() => form.validateAndSubmit(handleUpdate)}>
		<div class="form-control">
			<div class="w-full md:w-1/2 pr-0 md:pr-2 mb-3 md:mb-0">
				<label for="grid-first-name">Prénom *</label>
				<input
					bind:value={user.firstName}
					class:skeleton-box={isLoading}
					disabled={isLoading}
					use:bindClass={{ form, name: "firstName" }}
					id="grid-first-name"
					type="text"
					placeholder="ex : Jean"
				/>
				<ErrorContainer field={$form.fields.firstName} />
			</div>
			<div class="w-full md:w-1/2">
				<label for="grid-last-name">Nom *</label>
				<input
					bind:value={user.lastName}
					class:skeleton-box={isLoading}
					disabled={isLoading}
					use:bindClass={{ form, name: "lastName" }}
					type="text"
					placeholder="ex : Dupont"
				/>
				<ErrorContainer field={$form.fields.lastName} />
			</div>
		</div>
		<div class="form-control">
			<div class="w-full md:w-1/2 pr-0 md:pr-2 mb-3 md:mb-0">
				<label for="grid-email">Email *</label>
				<input
					bind:value={user.email}
					disabled={isLoading}
					class:skeleton-box={isLoading}
					use:bindClass={{ form, name: "email" }}
					id="grid-email"
					type="email"
					placeholder="ex : jean.dupont@test.xyz"
				/>
				<ErrorContainer field={$form.fields.email} />
			</div>
			<div class="w-full md:w-1/2">
				<label for="grid-phone">Téléphone</label>
				<input
					bind:value={user.phone}
					disabled={isLoading}
					class:skeleton-box={isLoading}
					placeholder="ex : 06 01 02 03 04"
					id="grid-phone"
					type="tel"
					class="input-phone"
					use:initializeCleave
				/>
			</div>
		</div>
		<slot />
		<p class="text-sm mt-5">* champs requis</p>
		<div class="form-control mt-5">
			<button
				type="submit"
				class:disabled={isLoading || $form.isSubmitting || !$form.valid}
				class="btn btn-lg btn-primary w-full md:w-auto justify-center"
			>
				<Icon
					data={$form.isSubmitting ? faCircleNotch : faCheck}
					class="mr-1 inline"
					spin={$form.isSubmitting}
				/>
				Valider
			</button>
		</div>
	</form>
</div>
