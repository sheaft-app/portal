<script>
	import { onMount, getContext } from "svelte";
	import { REPLY_TO_OBSERVATION } from "../mutations";
	import { GET_OBSERVATIONS } from "../queries";
	import SheaftErrors from "../../services/SheaftErrors";
	import omit from "lodash/omit";
	import { format } from "date-fns";
	import Icon from "svelte-awesome";
	import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";
	import fr from "date-fns/locale/fr";
	import Roles from "../../enums/Roles";
	import GetRouterInstance from "../../services/SheaftRouter";
	import GetAuthInstance from "../../services/SheaftAuth";
	import BatchesRoutes from "../../routes/batches/routes";

	export let observation;

	const errorsHandler = new SheaftErrors();
	const routerInstance = GetRouterInstance();
	const authInstance = GetAuthInstance();
	const { mutate } = getContext("api");

	let value;
	let allReplies = [];
	let isSubmitting = false;

	onMount(() => {
		allReplies = [omit(observation, ["replies"]), ...observation.replies];
	});

	const sendReply = async () => {
		isSubmitting = true;
		await mutate({
			mutation: REPLY_TO_OBSERVATION,
			variables: {
				id: observation.id,
				comment: value,
			},
			success: (res) => {
				value = null;
				observation.replies = res.replies;
				allReplies = [omit(observation, ["replies"]), ...observation.replies];
			},
			errorsHandler,
			errorNotification: "Impossible de répondre à l'observation",
			clearCache: [GET_OBSERVATIONS, observation.id]
		});
		isSubmitting = false;
	};
</script>

<div>
	<div class="flex justify-between py-3 border-b-2 border-gray-200">
		<div class="flex items-center space-x-4">
			<img
				src={observation.user.picture ?? "img/icons/store.svg"}
				alt="Photo"
				class="w-6 sm:w-20 h-6 sm:h-20 rounded-full"
			/>
			<div class="flex flex-col leading-tight">
				<div class="text-2xl mt-1 flex items-center">
					<span class="text-gray-700 mr-3">{observation.user.id == authInstance.user.id ? 'Vous' : observation.user.name}</span>
				</div>
				<span class="text-gray-600">dernière mise à jour le {format(new Date(observation.updatedOn), "PPPP", { locale: fr })}</span>
			</div>
		</div>
	</div>
	<div
		id="messages"
		class="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
	>
		<p><span class="font-semibold">Produits concernés :</span>
			{observation.products.map(b => b.name).join(', ')}
		</p>
		<p class="mt-2"><span class="font-semibold">Lots concernés :</span>
			{#if authInstance.isInRole([Roles.Producer.Value])}
				{#each observation.batches as batch, index}
					{#if index == observation.batches.length - 1 && observation.batches.length > 1}
						<span>et </span>
					{/if}
					<span class="btn-link" on:click={() => routerInstance.goTo(BatchesRoutes.BatchDetails, { id: batch.id })}>{batch.number}</span>
					{#if index !== observation.batches.length - 1 && index !== observation.batches.length - 2}
						<span>&#44; </span>
					{/if}
				{/each}
			{:else}
				{observation.batches.map(b => b.number).join(', ')}
			{/if}
		</p>
		{#each allReplies as reply, index}
			<div class="chat-message">
				<div class="flex items-end" class:justify-end={reply.user.id == authInstance.user.id}>
					<div 
						class="flex flex-col space-y-2 text-xs max-w-xs mx-2"
						class:order-2={reply.user.id !== authInstance.user.id}
						class:items-start={reply.user.id !== authInstance.user.id}
						class:order-1={reply.user.id == authInstance.user.id}
						class:items-end={reply.user.id == authInstance.user.id}
						>
						<div>
							<span 
								class="px-4 py-2 rounded-lg inline-block"
								class:rounded-bl-none={reply.user.id !== authInstance.user.id}
								class:bg-gray-300={reply.user.id !== authInstance.user.id}
								class:text-gray-600={reply.user.id !== authInstance.user.id}
								class:rounded-br-none={reply.user.id == authInstance.user.id}
								class:bg-primary={reply.user.id == authInstance.user.id}
								class:text-white={reply.user.id == authInstance.user.id}
							>
								{reply.comment}</span>
						</div>
					</div>
					{#if !allReplies[index + 1] || (allReplies[index + 1].user.id !== reply.user.id)}					
						<img
							src={reply.user.picture ?? "img/icons/store.svg"}
							alt={reply.user.name}
							class:order-1={reply.user.id !== authInstance.user.id}
							class:order-2={reply.user.id == authInstance.user.id}
							class="w-6 h-6 rounded-full"
						/>
					{:else}
						<div 
							class="w-6 h-6"
							class:order-1={reply.user.id !== authInstance.user.id}
							class:order-2={reply.user.id == authInstance.user.id}>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
	{#if observation.user.kind === Roles.Producer.Value && (observation.user.id !== authInstance.user.id)}
		<p>Vous ne pouvez pas répondre à une observation quand elle est émise par le producteur.</p>
	{:else}
		<div class="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
			<div class="relative flex">
				<input
					bind:value
					type="text"
					placeholder="Répondre"
					class="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-8 bg-gray-200 rounded-full py-3"
				/>
				<div class="absolute right-0 items-center inset-y-0 hidden sm:flex">
					<button
						disabled={isSubmitting}
						class:disabled={isSubmitting}
						on:click={sendReply}
						type="button"
						class="inline-flex items-center justify-center rounded-full h-12 w-12 transition duration-500 ease-in-out text-white bg-primary hover:bg-green-400 focus:outline-none"
					>
						{#if isSubmitting}
							<Icon data={faCircleNotch} spin />
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								class="h-6 w-6 transform rotate-90"
							>
								<path
									d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
								/>
							</svg>
						{/if}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.scrollbar-w-2::-webkit-scrollbar {
		width: 0.25rem;
		height: 0.25rem;
	}

	.scrollbar-track-blue-lighter::-webkit-scrollbar-track {
		--bg-opacity: 1;
		background-color: #f7fafc;
		background-color: rgba(247, 250, 252, var(--bg-opacity));
	}

	.scrollbar-thumb-blue::-webkit-scrollbar-thumb {
		--bg-opacity: 1;
		background-color: #edf2f7;
		background-color: rgba(237, 242, 247, var(--bg-opacity));
	}

	.scrollbar-thumb-rounded::-webkit-scrollbar-thumb {
		border-radius: 0.25rem;
	}
</style>
