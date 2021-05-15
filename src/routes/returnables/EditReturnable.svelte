<script>
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import Loader from "../../components/Loader.svelte";
	import Icon from "svelte-awesome";
	import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
	import { UPDATE_RETURNABLE } from "./mutations";
	import { GET_RETURNABLE_DETAILS } from "./queries";
	import ReturnableForm from "./ReturnableForm.svelte";
	import DeleteReturnable from "./DeleteReturnable.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import ReturnableRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "../../components/ErrorCard.svelte";

	export let params;

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate, isLoading } = getContext("api");
	const routerInstance = GetRouterInstance();

	let returnable = null;

	onMount(async () => {
		returnable = await query({
			query: GET_RETURNABLE_DETAILS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(ReturnableRoutes.List),
			errorNotification: "Impossible de récupérer les informations de la consigne."
		});
	});

	const handleSubmit = async () => {
		return mutate({
			mutation: UPDATE_RETURNABLE,
			variables: returnable,
			errorsHandler,
			success: () => routerInstance.goTo(ReturnableRoutes.List),
			successNotification: "La consigne a bien été modifiée",
			errorNotification: "La modification de la consigne a échoué"
		});
	};

	const showDeleteModal = () => {
		open(DeleteReturnable, {
			returnable,
			onClose: () => routerInstance.goTo(ReturnableRoutes.List),
		});
	};
</script>

<svelte:head>
	<title>Modifier la consigne</title>
</svelte:head>

<TransitionWrapper>
	<ErrorCard {errorsHandler} />
	{#if !returnable}
		<Loader />
	{:else}
		<section
			class="mb-4 pb-4 border-b border-gray-400 border-solid lg:pt-2">
			<div class="mb-3">
				<button
					class="text-gray-600 items-center flex uppercase"
					on:click={() => routerInstance.goTo(ReturnableRoutes.List)}>
					<Icon data={faChevronLeft} class="mr-2 inline" />
					Consignes
				</button>
			</div>
			<h1 class="font-semibold uppercase mb-0">{returnable.name}</h1>
			<div class="flex mt-2">
        <button
          class="btn btn-lg bg-white text-red-500 border border-red-500 hover:bg-red-500 hover:text-white"
          on:click={showDeleteModal}>
          Supprimer
        </button>
      </div>
		</section>
		<ReturnableForm submit={handleSubmit} {returnable} isLoading={$isLoading} />
	{/if}
</TransitionWrapper>
