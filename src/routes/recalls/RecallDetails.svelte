<script>
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { GET_RECALLS, GET_RECALL } from "./queries";
	import RecallRoutes from "./routes";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";

	export let params = {};

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();

	let isLoading = true;
	let recall = undefined;

	onMount(async () => {
		isLoading = true;
		recall = await query({
			query: GET_RECALL,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goTo(RecallRoutes.List),
			errorNotification: "La campagne de rappel à laquelle vous essayez d'accéder n'existe plus.",
		});
		isLoading = false;
	});
</script>

<TransitionWrapper>
	<PageHeader name={recall ? recall.name : "Campagne de rappel"} previousPage={RecallRoutes.List} />
	<PageBody {errorsHandler} {isLoading} loadingMessage="Chargement des informations en cours.">
		<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5">
			<div
				class="flex flex-wrap bg-white w-full items-top border
        border-gray-400"
			>
				<div
					class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-400"
				>
					<p class="uppercase font-bold pb-2">Commande</p>
					<div class="mt-3">
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Référence :</span>
							</p>
						</div>
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Créée le :</span>
								{format(new Date(recall.createdOn), "PPPPp", { locale: fr })}
							</p>
						</div>
					</div>
				</div>
				<div
					class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-400"
				>
					<p class="uppercase font-bold pb-2">Contenu</p>
					<div class="mt-3">
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Articles :</span>
							</p>
						</div>
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Montant TTC :</span>
							</p>
						</div>
					</div>
				</div>
				<div
					class="w-full lg:w-2/6 border-b md:border-b-0 border-solid
          border-gray-400 px-4 lg:px-8 py-5"
				>
					<p class="uppercase font-bold pb-2">Client</p>
					<div class="mt-3">
						<div>
							<p class="mb-2">
								<span class="text-gray-600">Nom :</span>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-white border-t md:border border-gray-400">
			<div class=" px-4 py-5">
				<p class="uppercase font-bold pb-2">Description</p>
				<p>{recall.comment}</p>
			</div>
		</div>
	</PageBody>
</TransitionWrapper>
