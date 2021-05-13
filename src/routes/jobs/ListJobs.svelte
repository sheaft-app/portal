<script>
	import {getContext} from "svelte";
	import Icon from "svelte-awesome";
	import {format} from "date-fns";
	import fr from "date-fns/locale/fr";
	import Table from "./../../components/table/Table.svelte";
	import Actions from "./../../components/table/Actions.svelte";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
	import ProcessStatusKind from "./../../enums/ProcessStatusKind.js";
	import JobKind from "./../../enums/JobKind.js";
	import {
		faArchive,
		faCalendarAlt,
		faClock,
		faTimes,
		faPause,
		faPlay,
		faRedoAlt,
	} from "@fortawesome/free-solid-svg-icons";
	import {PAUSE_JOBS, RESUME_JOBS} from "./mutations.js";
	import {GET_JOBS} from "./queries.js";
	import CancelJobs from "./CancelJobs.svelte";
	import RetryJobs from "./RetryJobs.svelte";
	import ArchiveJobs from "./ArchiveJobs.svelte";
	import JobRoutes from "./routes";
	import SheaftErrors from "../../services/SheaftErrors";
	import GetRouterInstance from "../../services/SheaftRouter";
	import PageHeader from "../../components/PageHeader.svelte";
	import PageBody from "../../components/PageBody.svelte";

	const errorsHandler = new SheaftErrors();
	const {open} = getContext("modal");
	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();

	let selectedItems = [];
	let items = [];
	let noResults = false;
	$: isLoading = true;

	const headers = [
		{name: "Nom", sortLabel: "name"},
		{name: "Type", displayOn: "md"},
		{name: "Créée le", sortLabel: "createdOn"},
		{name: "Statut", displayOn: "md", sortLabel: "status"},
		{name: "Dernière mise à jour", displayOn: "md"},
	];

	const getLastUpdate = (job) => {
		if (job.updatedOn) return job.updatedOn;
		return job.createdOn;
	};

	const cancelJobs = () => {
		openModal(CancelJobs, selectedItems);
	};

	const retryJobs = () => {
		openModal(RetryJobs, selectedItems);
	};

	const archiveJobs = () => {
		openModal(ArchiveJobs, selectedItems);
	};

	const pauseJobs = async () => {
		await handleJobsCommand(PAUSE_JOBS);
		routerInstance.refresh();
	};

	const resumeJobs = async () => {
		await handleJobsCommand(RESUME_JOBS);
		routerInstance.refresh();
	};

	const openModal = (modal, selectedJobs) => {
		open(modal, {
			jobs: selectedJobs,
			onClose: async (res) => {
				if (res.success) {
					routerInstance.refresh();
					selectedItems = [];
				}
			},
		});
	};

	const handleJobsCommand = async (mutation) => {
		isLoading = true;

		var res = await graphQLInstance.mutate(
			mutation,
			{
				ids: selectedItems.map((s) => s.id),
			},
			errorsHandler.Uuid,
			GET_JOBS
		);

		isLoading = false;

		if (!res.success) {
			//TODO
			return;
		}

		selectedItems = [];
	};

	const getRowBackgroundColor = (item) => {
		return "";
	};

	const onRowClick = (item) => {
		routerInstance.goTo(JobRoutes.Details, {id: item.id});
	};

	$: hasOneSelectedItem =
		canArchiveJobs ||
		canResumeJobs ||
		canPauseJobs ||
		canRetryJobs ||
		canCancelJobs;

	$: canArchiveJobs =
		selectedItems.length > 0 &&
		selectedItems.filter(
			(o) =>
				o.status == ProcessStatusKind.Done.Value ||
				o.status == ProcessStatusKind.Failed.Value ||
				o.status == ProcessStatusKind.Cancelled.Value
		).length == selectedItems.length;

	$: canResumeJobs =
		selectedItems.length > 0 &&
		selectedItems.filter((o) => o.status == ProcessStatusKind.Paused.Value)
			.length == selectedItems.length;

	$: canPauseJobs =
		selectedItems.length > 0 &&
		selectedItems.filter((o) => o.status == ProcessStatusKind.Processing.Value)
			.length == selectedItems.length;

	$: canRetryJobs =
		selectedItems.length > 0 &&
		selectedItems.filter((o) => o.status == ProcessStatusKind.Failed.Value)
			.length == selectedItems.length;

	$: canCancelJobs =
		selectedItems.length > 0 &&
		selectedItems.filter(
			(o) =>
				o.status != ProcessStatusKind.Done.Value &&
				o.status != ProcessStatusKind.Failed.Value
		).length == selectedItems.length;

	$: actions = [
		{
			click: () => retryJobs(),
			disabled: !canRetryJobs,
			text: "Réinitialiser",
			icon: faRedoAlt,
			color: "teal",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true
		},
		{
			click: () => pauseJobs(),
			disabled: !canPauseJobs,
			text: "Mettre en pause",
			icon: faPause,
			color: "orange",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true
		},
		{
			click: () => resumeJobs(),
			disabled: !canResumeJobs,
			text: "Reprendre",
			icon: faPlay,
			color: "green",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true
		},
		{
			click: () => cancelJobs(),
			disabled: !canCancelJobs,
			text: "Annuler",
			icon: faTimes,
			color: "red",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true
		},
		{
			click: () => archiveJobs(),
			disabled: !canArchiveJobs,
			text: "Archiver",
			icon: faArchive,
			color: "normal",
			hideIfDisabled: true,
			displaySelectedItemsNumber: true
		},
	];

	const noResultsPage = {Text: 'Aucune tâche en cours.'};
</script>

<TransitionWrapper>
	<PageHeader name="Mes tâches"/>
	<PageBody {errorsHandler}>
		<Actions {actions}/>
		<Table
			graphQuery={GET_JOBS}
			{errorsHandler}
			bind:items
			bind:noResults
			bind:selectedItems
			bind:isLoading
			loadingMessage="Récupération des tâches en cours... veuillez patienter"
			{actions}
			{headers}
			let:rowItem={job}
			defaultSearchValues={JobRoutes.List.Params.Query}
			{getRowBackgroundColor}
			{onRowClick}>
			<td class="px-2 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200">
				<div class="text-xs leading-5 font-semibold text-{ProcessStatusKind.color(job.status)}-500 block md:hidden">
					{ProcessStatusKind.label(job.status)}
				</div>
				<div class="text-sm leading-5 text-gray-800">{job.name}</div>
			</td>
			<td class="px-2 md:px-6 py-4 whitespace-no-wrap border-b border-gray-200 hidden md:table-cell">
				<div class="text-sm leading-5 text-gray-900">
					{JobKind.label(job.kind)}
				</div>
			</td>
			<td
				class="px-6 py-4 whitespace-no-wrap text-sm leading-5">
				<div>
					<p>
						<Icon data={faCalendarAlt} scale=".8" class=" inline" />
						{format(new Date(job.createdOn), 'PP', { locale: fr })}
					</p>
					<p class="text-gray-600">
						<Icon data={faClock} scale=".8" class=" inline" />
						{format(new Date(job.createdOn), 'p', { locale: fr })}
					</p>
				</div>
			</td>
			<td class="px-6 py-4 whitespace-no-wrap hidden md:table-cell">
			<span
				class="px-3 inline-flex text-xs leading-5 font-semibold rounded-full bg-{ProcessStatusKind.color(job.status)}-500
				text-white">
				{ProcessStatusKind.label(job.status)}
			</span>
			</td>
			<td
				class="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden md:table-cell">
				<div>
					<p>
						<Icon data={faCalendarAlt} scale=".8" class=" inline" />
						{format(new Date(getLastUpdate(job)), 'PP', { locale: fr })}
					</p>
					<p class="text-gray-600">
						<Icon data={faClock} scale=".8" class=" inline" />
						{format(new Date(getLastUpdate(job)), 'p', { locale: fr })}
					</p>
				</div>
			</td>
		</Table>
	</PageBody>
</TransitionWrapper>
