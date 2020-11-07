<script>
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "../../components/TransitionWrapper.svelte";
	import Loader from "../../components/Loader.svelte";
	import Icon from "svelte-awesome";
	import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
	import { UPDATE_RETURNABLE } from "./mutations";
	import { GET_RETURNABLES, GET_RETURNABLE_DETAILS } from "./queries";
	import ReturnableForm from "./ReturnableForm.svelte";
	import DeleteReturnable from "./DeleteReturnable.svelte";
	import GetRouterInstance from "../../services/SheaftRouter";
	import GetGraphQLInstance from "../../services/SheaftGraphQL";
	import ReturnableRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "../../components/ErrorCard.svelte";
    import GetNotificationsInstance from "./../../services/SheaftNotifications.js";

	export let params;

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
    const notificationsInstance = new GetNotificationsInstance();

	let isLoading = false;
	let returnable = null;

	onMount(async () => {
		await getReturnable(params.id);
	});

	const getReturnable = async (id) => {
		isLoading = true;
		var res = await graphQLInstance.query(
			GET_RETURNABLE_DETAILS,
			{
				id: id,
			},
			errorsHandler.Uuid
		);

		isLoading = false;

		if (!res.success) {
			//TODO
			routerInstance.goTo(ReturnableRoutes.List);
			return;
		}

		returnable = res.data;
	};

	const handleSubmit = async () => {
		isLoading = true;
		var res = await graphQLInstance.mutate(
			UPDATE_RETURNABLE,
			returnable,
			errorsHandler.Uuid
    );
    
		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}
		
		notificationsInstance.success(
      "Vos modifications ont bien été appliquées."
    );

		routerInstance.goTo(ReturnableRoutes.List);
	};

	const showDeleteModal = () => {
		open(DeleteReturnable, {
			returnable,
			onClose: async (res) => {
				if (res.success) {
      		graphQLInstance.clearApolloCache(GET_RETURNABLES);
					routerInstance.goTo(ReturnableRoutes.List);
				}
			},
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
			class="mb-4 pb-4 border-b border-gray-400 border-solid md:pt-12 lg:pt-2">
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
		<ReturnableForm submit={handleSubmit} {returnable} {isLoading} />
	{/if}
</TransitionWrapper>
