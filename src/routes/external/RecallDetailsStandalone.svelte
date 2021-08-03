<script>
	import { onMount, getContext } from "svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import SheaftErrors from "../../services/SheaftErrors";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";
	import { GET_RECALL_CLIENTS, GET_RECALL, GET_RECALL_ANONYMOUS } from "./queries";
	import { format } from "date-fns";
	import fr from "date-fns/locale/fr";
	import RecallStatus from "./../../enums/RecallStatus";
	import GetAuthInstance from "../../services/SheaftAuth";
	import Roles from "../../enums/Roles";
	import ExternalRoutes from "../external/routes";
	import Icon from "svelte-awesome";
	import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

	export let params = {};

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const { query, mutate } = getContext("api");
	const routerInstance = GetRouterInstance();
	const authInstance = GetAuthInstance();

	let isLoading = true;
	let recall = undefined;

	onMount(async () => {
		isLoading = true;
		recall = await query({
			query: authInstance.isInRole(Roles.Producer.Value)
				? GET_RECALL_CLIENTS
				: authInstance.isInRole(Roles.Store.Value)
				? GET_RECALL
				: GET_RECALL_ANONYMOUS,
			variables: { id: params.id },
			errorsHandler,
			error: () => routerInstance.goBack(),
			errorNotification: "La campagne de rappel à laquelle vous essayez d'accéder n'existe plus.",
		});
		isLoading = false;
	});
</script>

<TransitionWrapper>
	<PageHeader name="Campagne de rappel" previous={true} />
	<PageBody {errorsHandler} {isLoading} loadingMessage="Chargement des informations en cours.">
		{#if recall.userAffected}
			<div
				class="my-4 py-4 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-red-200 shadow
          md:rounded md:mb-2 flex items-center"
			>
				<Icon data={faExclamationTriangle} style="width: 50px; height:50px;" />
				<p class="ml-3">
					<strong>Vous êtes concerné par cette campagne de rappel</strong>. Veuillez vérifier les produits en
					question et n'hésitez pas à contacter le producteur{#if recall.producer.email}
						&nbsp;par
						<a href="mailto:{recall.producer.email}">email</a>{/if}{#if recall.producer.phone}
						&nbsp;ou par <a href="tel:{recall.producer.phone}">téléphone</a>{/if}.
				</p>
			</div>
		{/if}
		<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5">
			<div
				class="flex flex-wrap bg-white w-full items-top border
        border-gray-400"
			>
				<div
					class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-400"
				>
					<p class="uppercase font-bold pb-2">Campagne</p>
					<div class="mt-3">
						{#if authInstance.isInRole(Roles.Producer.Value)}
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-600">Statut :</span>
									{RecallStatus.label(recall.status)}
								</p>
							</div>
						{:else}
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-600">Producteur :</span>
									{recall.producer.name}
								</p>
							</div>
						{/if}
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Nom :</span>
								{recall.name}
							</p>
						</div>
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Créée le :</span>
								{format(new Date(recall.createdOn), "PPPP", { locale: fr })}
							</p>
						</div>
					</div>
				</div>
				<div
					class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-400"
				>
					<p class="uppercase font-bold pb-2">Période de vente</p>
					<div class="mt-3">
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Début :</span>
								{format(new Date(recall.saleStartedOn), "P", { locale: fr })}
							</p>
						</div>
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-600">Fin :</span>
								{format(new Date(recall.saleEndedOn), "P", { locale: fr })}
							</p>
						</div>
					</div>
				</div>
				<div
					class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
          lg:border-r border-solid border-gray-400"
				>
					<p class="uppercase font-bold pb-2">Lots concernés</p>
					<div class="mt-3">
						<div class="mb-2">
							{#each recall.batches as batch}
								<p>
									{batch.number} ({batch.dlc
										? format(new Date(batch.dlc), "P", { locale: fr })
										: ""}{batch.ddm ? format(new Date(batch.ddm), "P", { locale: fr }) : ""})
								</p>
							{/each}
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
		<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-white border-t md:border border-gray-400">
			<div class=" px-4 py-5">
				<p class="uppercase font-bold pb-2">Produits</p>
				<ul>
					{#each recall.products as product}
						<li>
							<a
								href="javascript:void(0)"
								on:click={() => routerInstance.goTo(ExternalRoutes.ProductDetails, { id: product.id })}
								>{product.name}</a
							>
						</li>
					{/each}
				</ul>
			</div>
		</div>
		{#if authInstance.isInRole(Roles.Producer.Value)}
			<div class="px-0 md:px-5 overflow-x-auto -mx-4 md:mx-0 bg-white border-t md:border border-gray-400">
				<div class=" px-4 py-5">
					<p class="uppercase font-bold pb-2">Clients</p>
					<ul>
						{#each recall.clients as client}
							<li><a href="mailto:{client.email}">{client.name}</a></li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}
	</PageBody>
</TransitionWrapper>
