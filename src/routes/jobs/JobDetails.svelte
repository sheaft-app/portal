<script>
	import Loader from "./../../components/Loader.svelte";
	import { onMount, getContext } from "svelte";
	import Icon from "svelte-awesome";
	import { format } from "date-fns";
	import { fr } from "date-fns/locale";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL";
	import JobKind from "./../../enums/JobKind";
	import ProcessStatusKind from "./../../enums/ProcessStatusKind";
	import CancelJobs from "./CancelJobs.svelte";
	import RetryJobs from "./RetryJobs.svelte";
	import ArchiveJobs from "./ArchiveJobs.svelte";
	import JobRoutes from "./routes";
	import {
		PAUSE_JOBS,
		RESUME_JOBS,
		CANCEL_JOBS,
		ARCHIVE_JOBS,
	} from "./mutations.js";
	import { GET_JOBS, GET_JOB_DETAILS } from "./queries.js";
	import {
		faArchive,
		faCircleNotch,
		faTimesCircle,
		faPause,
		faPlayCircle,
		faCheckDouble,
		faChevronLeft,
		faHourglass,
		faCheck,
		faTimes,
		faBackspace,
		faPlay,
		faClipboardCheck,
		faRedoAlt,
		faDownload,
	} from "@fortawesome/free-solid-svg-icons";
	import SheaftErrors from "../../services/SheaftErrors";
	import ErrorCard from "./../../components/ErrorCard.svelte";

	export let params = {};

	const errorsHandler = new SheaftErrors();
	const { open } = getContext("modal");
	const routerInstance = GetRouterInstance();
	const graphQLInstance = GetGraphQLInstance();

	let job = null;
	$: isLoading = false;

	onMount(async () => {
		await getJob(params.id);
	});

	const getJob = async (id) => {
		isLoading = true;
		var res = await graphQLInstance.query(
			GET_JOB_DETAILS,
			{ id },
			errorsHandler.Uuid
		);
		isLoading = false;

		if (!res.success) {
			//TODO
			routerInstance.goTo(JobRoutes.List);
			return;
		}

		job = res.data;
	};

	const pauseJob = async () => {
		await handleJobsCommand(PAUSE_JOBS, job);
	};

	const resumeJob = async () => {
		await handleJobsCommand(RESUME_JOBS, job);
	};

	const showArchiveModal = () => {
		showModal(ArchiveJobs, job);
	};

	const showCancelModal = () => {
		showModal(CancelJobs, job);
	};

	const showRetryModal = () => {
		showModal(RetryJobs, job);
	};

	const handleJobsCommand = async (mutation, currentJob) => {
		isLoading = true;
		var res = await graphQLInstance.mutate(
			mutation,
			{
				ids: [currentJob.id],
			},
			errorsHandler.Uuid,
			GET_JOBS
		);

		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}

    await getJob(currentJob.id);
	};

	const showModal = (modal, currentJob) => {
		open(modal, {
			jobs: [currentJob],
			onClose: async (res) => {
				if (res.success) {
          await getJob(currentJob.id);
				}
			},
		});
	};

	$: canPauseJob = job && job.status == ProcessStatusKind.Processing.Value;

	$: canResumeJob = job && job.status == ProcessStatusKind.Paused.Value;

	$: canArchiveJob =
		job &&
		(job.status == ProcessStatusKind.Failed.Value ||
			job.status == ProcessStatusKind.Done.Value ||
			job.status == ProcessStatusKind.Cancelled.Value);

	$: canCancelJob =
		job &&
		job.status != ProcessStatusKind.Done.Value &&
		job.status != ProcessStatusKind.Failed.Value;

	$: canRetryJob = job && job.status == ProcessStatusKind.Failed.Value;
</script>

<TransitionWrapper>
	<ErrorCard {errorsHandler} />
	{#if !job}
		<Loader />
	{:else}
		<section class="mx-0 pb-5">
			<div class="mb-3">
				<button
					class="text-gray-500 items-center flex uppercase"
					on:click={() => routerInstance.goBack()}>
					<Icon data={faChevronLeft} scale=".8" class="mr-2 inline" />
					Tâches
				</button>
			</div>
			<div class="flex flex-wrap items-center">
				<div>
					<h1 class="text-3xl mb-0 text-gray-700">Détails de la tâche</h1>
				</div>
			</div>
		</section>
		{#if job.status == ProcessStatusKind.Cancelled.Value}
			<div
				class="py-5 px-8 md:px-5 overflow-x-auto -mx-5 md:mx-0 shadow rounded
				mb-5 bg-orange-400 text-white">
				<div class="flex">
					<Icon data={faBackspace} scale="1.5" class="mr-5" />
					<div>
						<p class="uppercase font-bold leading-none">Tâche annulée</p>
						<div class="mt-2">
							<p>Cette tâche a été annulée volontairement</p>
							<p class="font-bold">{job.message ? job.message : ''}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if job.status == ProcessStatusKind.Waiting.Value}
			<div
				class="py-5 px-8 md:px-5 overflow-x-auto -mx-5 md:mx-0 shadow rounded
				mb-5 bg-white">
				<div class="flex">
					<Icon data={faHourglass} scale="1.5" class="mr-5 text-orange-400" />
					<div>
						<p class="uppercase font-bold leading-none">En attente</p>
						<div class="mt-2">
							<p>Le traitement devrait démarrer très prochainement</p>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if job.status == ProcessStatusKind.Done.Value}
			<div
				class="py-5 px-8 md:px-5 overflow-x-auto -mx-5 md:mx-0 shadow rounded
				mb-5 bg-white">
				<div class="flex">
					<Icon data={faCheck} scale="1.5" class="mr-5 text-green-500" />
					<div>
						<p class="uppercase font-bold leading-none">Terminée</p>
						<div class="mt-2">
							<p>Cette tâche s'est executée avec succès</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
		{#if job.status == ProcessStatusKind.Failed.Value}
			<div
				class="py-5 px-8 md:px-5 overflow-x-auto -mx-5 md:mx-0 shadow rounded
				mb-5 bg-red-400 text-white">
				<div class="flex">
					<Icon data={faTimesCircle} scale="1.5" class="mr-5 " />
					<div>
						<p class="uppercase font-bold leading-none">Erreur</p>
						<div class="mt-2">
							<p>Une erreur s'est produite pendant l'execution de la tâche</p>
							<p class="font-bold">{job.message ? job.message : ''}</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
		{#if job.status == ProcessStatusKind.Processing.Value}
			<div
				class="py-5 px-8 md:px-5 overflow-x-auto -mx-5 md:mx-0 shadow rounded
				mb-5 bg-white">
				<div class="flex">
					<Icon data={faCircleNotch} scale="1.5" class="mr-5 text-teal-400" />
					<div>
						<p class="uppercase font-bold leading-none">En cours</p>
						<div class="mt-2">
							<p>Cette tâche est actuellement en cours de traitement.</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
		{#if job.status == ProcessStatusKind.Paused.Value}
			<div
				class="py-5 px-8 md:px-5 overflow-x-auto -mx-5 md:mx-0 shadow rounded
				mb-5 bg-white">
				<div class="flex">
					<Icon data={faPause} scale="1.5" class="mr-5 text-yellow-400" />
					<div>
						<p class="uppercase font-bold leading-none">En pause</p>
						<div class="mt-2">
							<p>Cette tâche a été mise en pause temporairement.</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
		<div
			class="bg-white shadow border-b border-solid border-gray-400 mt-5 px-0
			md:px-5 py-5 overflow-x-auto -mx-5 md:mx-0">
			<div class="flex">
				<button
					on:click={showRetryModal}
					class:hidden={!canRetryJob}
					class="py-1 px-3 rounded items-center flex transition duration-300
					ease-in-out text-teal-500">
					<Icon data={faRedoAlt} class="mr-2 hidden lg:inline" />
					<span>Réinitialiser la tâche</span>
				</button>
				<button
					on:click={pauseJob}
					class:hidden={!canPauseJob}
					class="py-1 px-3 rounded items-center flex transition duration-300
					ease-in-out text-orange-500">
					<Icon data={faPause} class="mr-2 hidden lg:inline" />
					<span>Mettre en pause</span>
				</button>
				<button
					on:click={resumeJob}
					class:hidden={!canResumeJob}
					class="py-1 px-3 rounded items-center flex transition duration-300
					ease-in-out text-green-500">
					<Icon data={faPlay} class="mr-2 hidden lg:inline" />
					<span>Reprendre l'execution de la tâche</span>
				</button>
				<button
					on:click={showCancelModal}
					class:hidden={!canCancelJob}
					class="py-1 px-3 rounded items-center flex transition duration-300
					ease-in-out text-red-500">
					<Icon data={faTimes} class="mr-2 hidden lg:inline" />
					<span>Annuler la tâche</span>
				</button>
				<button
					on:click={showArchiveModal}
					class:hidden={!canArchiveJob}
					class="py-1 px-3 rounded items-center flex transition duration-300
					ease-in-out text-gray-600">
					<Icon data={faArchive} class="mr-2 hidden lg:inline" />
					<span>Archiver la tâche</span>
				</button>
			</div>
		</div>
		<div class="px-0 md:px-5 overflow-x-auto -mx-5">
			<div
				class="flex flex-wrap bg-white w-full shadow items-center border-b
				border-gray-400">
				<div
					class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
					lg:border-r border-solid border-gray-400">
					<p class="uppercase font-bold text-gray-700 pb-2">Tâche</p>
					<div class="mt-3">
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-500">Nom :</span>
								{job.name}
							</p>
						</div>
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-500">Type :</span>
								{JobKind.label(job.kind)}
							</p>
						</div>
					</div>
				</div>
				<div
					class="w-full lg:w-2/6 px-4 lg:px-8 py-5 border-b lg:border-b-0
					lg:border-r border-solid border-gray-400">
					<p class="uppercase font-bold text-gray-700 pb-2">Traitement</p>
					<div class="mt-3">
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-500">Créée le :</span>
								{format(new Date(job.createdOn), 'PPPPp', { locale: fr })}
							</p>
						</div>
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-500">Démarrée le :</span>
								{#if job.startedOn}
									{format(new Date(job.startedOn), 'PPPPp', { locale: fr })}
								{:else}en attente{/if}
							</p>
						</div>
						<div class="flex items-center mb-2">
							<p>
								<span class="text-gray-500">Demandeur :</span>
								{job.user.name}
							</p>
						</div>
					</div>
				</div>
				{#if job.completedOn}
					<div
						class="w-full lg:w-2/6 border-b md:border-b-0 border-solid
						border-gray-400 px-4 lg:px-8 py-5">
						<p class="uppercase font-bold text-gray-700 pb-2">Résultat</p>
						<div class="mt-3">
							<div class="flex items-center mb-2">
								<p>
									<span class="text-gray-500">Terminée le :</span>
									{format(new Date(job.completedOn), 'PPPPp', { locale: fr })}
								</p>
							</div>
							{#if job.file}
								<div class="flex items-center mb-2">
									<p>
										<span class="text-gray-500">Fichier :</span>
										<a href={job.file}>Télécharger</a>
									</p>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div
						class="w-full lg:w-2/6 border-b md:border-b-0 border-solid
						border-gray-400 px-4 lg:px-8 py-5">
						<p class="uppercase font-bold text-gray-700 pb-2">Résultat</p>
						<div class="mt-3">
							<div class="flex items-center mb-2">
								<p>
									Lorsque le traitement sera terminé, les informations relatives
									seront affichées ici.
								</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</TransitionWrapper>
