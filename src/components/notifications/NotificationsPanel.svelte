<script>
	import { onMount } from "svelte";
	import { fly } from "svelte/transition";
	import { format, formatDistance, formatRelative } from "date-fns";
	import fr from "date-fns/locale/fr";
	import Icon from "svelte-awesome";
	import { faTimes } from "@fortawesome/free-solid-svg-icons";
	import { notifications, displayNotificationCenter, notificationsCount } from "./store.js";
	import { GET_NOTIFICATIONS } from "./queries.js";
	import {
		MARK_USER_NOTIFICATIONS_AS_READ,
		MARK_USER_NOTIFICATION_AS_READ,
	} from "./mutations.js";
	import {
		getFormattedNotification,
		getNotificationIcon,
		getNotificationColor,
	} from "./helpers.js";
	import GetGraphQLInstance from "./../../services/SheaftGraphQL";
	import GetRouterInstance from "./../../services/SheaftRouter";

	const graphQLInstance = GetGraphQLInstance();
	const routerInstance = GetRouterInstance();
	const PAGE_LIMIT_SIZE = 30;

	let isLoading = false;
	let notificationsHidden = false;

	let pageInfo = {
		hasNextPage: false,
		endCursor: null,
	};

	const createVariables = () => {
		return {
			first: PAGE_LIMIT_SIZE,
			after: pageInfo.endCursor,
		};
	};

	const getDisplayDate = (date) => {
		return formatDistance(date, new Date(), { locale: fr });
	};

	const getNextResults = async () => {
		isLoading = true;
		var res = await graphQLInstance.query(GET_NOTIFICATIONS, createVariables());
		if (!res.success) {
			isLoading = false;
			//TODO
			return;
		}

		pageInfo = res.pageInfo;
		parseNotifications(res.data);
		isLoading = false;
	};

	const markAllAsRead = async (date) => {
		isLoading = true;
		var res = await graphQLInstance.mutate(MARK_USER_NOTIFICATIONS_AS_READ);
		if(!res.success){				
			isLoading = false;
			return;
		}

		date = new Date(res.data);
		var array = $notifications.map((e) => {
			if (e.createdOn < date) e.unread = false;
			return e;
		});

		notifications.set(array);
		notificationsCount.set(array.filter((e) => e.unread).length);
	};

	const markAsRead = async (notification) => {
		if (notification.url) routerInstance.goTo(notification.url);

		var res = await graphQLInstance.mutate(MARK_USER_NOTIFICATION_AS_READ, {
			id: notification.id,
		});

		var array = $notifications.map((e) => {
			if (e.id == notification.id) e.unread = false;
			return e;
		});

		notifications.set(array);
		notificationsCount.set(array.filter((e) => e.unread).length);
		displayNotificationCenter.set(false);
	};

	const parseNotifications = (notifs) => {
		if (!notifs || notifs.length == 0) {			
			notificationsHidden = true;
			notifications.set([]);
			notificationsCount.set(0);
			return;
		}

		var results = notifs.map((n) => getFormattedNotification(null, n, false));
		var arr = [...$notifications, results][0];

		notifications.set(arr);
		notificationsCount.set(arr.filter((e) => e.unread).length);
	};

	$: hasUnreadNotification = $notifications.filter((n) => n.unread).length > 0;
	$: hasMoreNotifications = pageInfo.hasNextPage;

	onMount(async () => {
		setTimeout(async() => { 
			await markAllAsRead(new Date());
		}, 5000);		

		if ($notifications && $notifications.length > 0) return;

		await getNextResults();
	});
</script>

<div
	transition:fly={{ x: 300 }}
	class="notification-center fixed bg-white right-0 bottom-0 border border-solid
	border-gray-400 overflow-auto pb-2 z-10 text-gray-600">
	<div class="flex items-center p-3 text-center">
		<h3 class="font-semibold w-11/12 m-0">Notifications</h3>
		<span
			class="w-1/12 cursor-pointer"
			on:click={() => {
				displayNotificationCenter.set(!$displayNotificationCenter);
			}}>
			<Icon data={faTimes} />
		</span>
	</div>
	<hr />

	{#if $notifications.length > 0}
		<div class="flex flex-wrap text-xs underline p-2">
			{#if notificationsHidden}
				<a
					href="javascript:void(0)"
					class="w-1/2"
					on:click={() => (notificationsHidden = false)}>
					Afficher toutes les notifications
				</a>
			{/if}
			{#if !notificationsHidden}
				<a
					href="javascript:void(0)"
					class="w-1/2"
					on:click={() => (notificationsHidden = true)}>
					Masquer les notifications lues
				</a>
			{/if}
			{#if hasUnreadNotification}
				<a
					href="javascript:void(0)"
					class="w-1/2 text-right"
					on:click={markAllAsRead}>
					Tout marquer comme lu
				</a>
			{/if}
		</div>
	{/if}
	<ul>
		{#each $notifications
			.filter((e) => {
				if (notificationsHidden && !e.unread) return;
				return e;
			})
			.sort((a, b) => (a.createdOn < b.createdOn ? 1 : -1)) as notification}
			<li
				class="flex hover:bg-gray-100 px-2 py-2 border-b border-solid
				border-gray-200 cursor-pointer"
				on:click={markAsRead(notification)}>
				<div class="w-1/12 flex items-center justify-center mx-2">
					<Icon
						data={getNotificationIcon(notification)}
						class={getNotificationColor(notification)}
						scale="1.2" />
				</div>
				<div class="w-11/12 px-1">
					<div
						class="text-normal"
						style="font-size:0.9em;"
						class:font-semibold={notification.unread}>
						{@html notification.message}
					</div>
					<div>
						{#if notification.unread}
							<span class="primary-color">&#8226;</span>
							<span class="font-bold text-xs pt-1 primary-color">
								il y a {getDisplayDate(notification.createdOn)}
							</span>
						{:else}
							<span class="font-semibold text-xs pt-1">
								il y a {getDisplayDate(notification.createdOn)}
							</span>
						{/if}

					</div>
				</div>
			</li>
		{/each}
		{#if !notificationsHidden && hasMoreNotifications}
			<li class="text-center">
				<a href="javascript:void(0)" class="underline text-xs">
					Charger plus de notifications
				</a>
			</li>
		{/if}
	</ul>
	{#if !hasUnreadNotification && notificationsHidden}
		<div
			class="text-center text-xl text-gray-500 m-auto px-6"
			style="transform: translateY(15%);">
			<p>Hooray !</p>
			<p class="mb-5">Aucune notification non lue pour le moment.</p>
			<img
				src="/img/no_new_notifications.svg"
				class="m-auto"
				style="width: 200px; height: auto"
				alt="Aucune notification" />
		</div>
	{/if}
</div>

<style>
	.notification-center {
		width: 100%;
		top: 45px;
	}

	@media (min-width: 1025px) {
		.notification-center {
			width: 28em;
			top: 64px;
		}
	}
</style>
