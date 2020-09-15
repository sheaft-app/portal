<script>
	import Loader from "./../../components/Loader.svelte";
	import { onMount } from "svelte";
	import Icon from "svelte-awesome";
	import { faCircleNotch, faCheck } from "@fortawesome/free-solid-svg-icons";
	import GetAuthInstance from "./../../services/SheaftAuth.js";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import { UPDATE_CONSUMER } from "./mutations.js";
	import { GET_CONSUMER_DETAILS } from "./queries.js";
	import { form, bindClass } from '../../../vendors/svelte-forms/src/index';
  import ErrorContainer from "./../../components/ErrorContainer.svelte";

	export let errorsHandler, userId;
	const graphQLInstance = GetGraphQLInstance();
	const authInstance = GetAuthInstance();

	let isLoading = false;
	let consumer = {
		firstName: null,
		lastName: null,
		email: null
	};

	const handleGet = async () => {
		isLoading = true;
		var res = await graphQLInstance.query(
			GET_CONSUMER_DETAILS,
			{
				id: userId,
			},
			errorsHandler.Uuid
		);
		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}

		consumer = res.data;
	};

	const handleUpdate = async () => {
		consumerForm.validate();

		if ($consumerForm.valid) {
			isLoading = true;

			var res = await graphQLInstance.mutate(
				UPDATE_CONSUMER,
				consumer,
				errorsHandler.Uuid
			);
			isLoading = false;

			if (!res.success) {
				//TODO
				return;
			}

			await authInstance.loginSilent();
		}
	};
	
	const consumerForm = form(() => ({
    firstName: { value: consumer.firstName, validators: ['required'], enabled: true },
    lastName: { value: consumer.lastName, validators: ['required'], enabled: true },
    email: { value: consumer.email, validators: ['required', 'email'], enabled: true },
	}), {
    initCheck: false
	});
	
	onMount(async () => {
		await handleGet();
	});
</script>

{#if isLoading || !consumer}
	<Loader />
{:else}
	<form class="w-full" on:submit|preventDefault={() => handleUpdate()}>
		<div class="form-control">
			<div class="w-full md:w-2/4 pr-0 md:pr-2 mb-3 md:mb-0">
				<label for="grid-first-name">Prénom *</label>
				<input
					bind:value={consumer.firstName}
					use:bindClass={{ form: consumerForm, name: "firstName" }}
					id="grid-first-name"
					type="text"
					placeholder="ex : Jean" />
				<ErrorContainer field={$consumerForm.fields.firstName} />
			</div>
			<div class="w-full md:w-2/4">
				<label for="grid-last-name">Nom *</label>
				<input
					bind:value={consumer.lastName}
					use:bindClass={{ form: consumerForm, name: "lastName" }}
					type="text"
					placeholder="ex : Dupont" />
				<ErrorContainer field={$consumerForm.fields.lastName} />
			</div>
		</div>
		<div class="form-control">
			<div class="w-full md:w-3/3">
				<label for="grid-email">Email *</label>
				<input
					bind:value={consumer.email}
					use:bindClass={{ form: consumerForm, name: "email" }}
					id="grid-email"
					type="email"
					placeholder="ex : jean.dupont@test.xyz" />
				<ErrorContainer field={$consumerForm.fields.email} />
			</div>
		</div>
		<div class="form-control">
			<div class="w-full md:w-1/2">
				<label for="grid-phone">Téléphone</label>
				<input bind:value={consumer.phone} id="grid-phone" type="tel" />
			</div>
		</div>
		<p class="text-sm mt-5">* champs requis</p>
		<div class="form-control mt-5">
			<button
				type="submit"
				class:disabled={isLoading || !$consumerForm.valid}
				class="btn btn-xl btn-primary w-full md:w-auto justify-center">
				<Icon
					data={isLoading ? faCircleNotch : faCheck}
					class="mr-1 inline"
					spin={isLoading} />
				Valider
			</button>
		</div>
	</form>
{/if}
