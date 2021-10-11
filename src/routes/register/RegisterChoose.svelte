<script>
	import Icon from "svelte-awesome";
	import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
	import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
	import { onMount } from "svelte";
	import GetRouterInstance from "./../../services/SheaftRouter";
	import RegisterRoutes from "./routes";
	import Roles from "./../../enums/Roles";

	const routerInstance = GetRouterInstance();

	onMount(() => {
		const choosenRole = JSON.parse(localStorage.getItem("user_choosen_role"));
		switch (choosenRole) {
			case Roles.Producer.Value:
				routerInstance.goTo(RegisterRoutes.Owner, { id: Roles.Producer.Id });
				return;
			case Roles.Store.Value:
				routerInstance.goTo(RegisterRoutes.Owner, { id: Roles.Store.Id });
				return;
			case Roles.Consumer.Value:
				routerInstance.goTo(RegisterRoutes.Consumer);
				return;
			default:
				localStorage.removeItem("user_choosen_role");
		}
	});
</script>

<svelte:head>
	<title>Enregistrement</title>
</svelte:head>

<TransitionWrapper classNames="m-auto">
	<div class="mx-0 py-2 overflow-x-auto sm:px-4 lg:px-8 text-center">
		<div class="pb-4 lg:py-8">
			<h2 class="lg:text-3xl">Bienvenue sur notre plateforme ! 🥳</h2>
			<p class="mb-2 text-base lg:text-lg pt-2 lg:pt-0">
				Avant de commencer, nous avons besoin de savoir ce que vous attendez de Sheaft.
			</p>
		</div>
		<div class="flex flex-wrap lg:flex-no-wrap px-1">
			<div
				on:click={() => routerInstance.goTo(RegisterRoutes.Consumer)}
				class="mx-0 lg:w-1/3 py-2 overflow-x-auto sm:px-6 lg:px-8 w-full
        inline-block hover:bg-gray-100 bg-white shadow lg:block flex
        cursor-pointer flex-wrap text-left justify-between lg:mb-0 mb-3"
			>
				<p
					class="hidden lg:block font-semibold uppercase tracking-wide
          text-center text-xl mb-5 py-2 rounded"
				>
					Je suis
					<span class="text-accent">consommateur</span>
				</p>
				<img
					style="max-width: 129px;"
					src="/img/consumer.svg"
					alt="Image consommateur"
					class="w-2/12 lg:w-3/4 lg:m-auto ml-2"
				/>
				<div class="w-8/12 lg:w-full ml-3 lg:ml-0 lg:text-center">
					<p class="block lg:hidden font-semibold uppercase tracking-wide">
						Je suis
						<span class="text-accent">consommateur</span>
					</p>
					<p class="lg:mt-5 mt-2 lg:text-lg">
						Je veux trouver et commander les produits des producteurs autour de moi.
					</p>
				</div>
				<div class="block lg:hidden w-1/12 flex items-center -my-2">
					<Icon data={faChevronRight} class="text-normal m-auto" />
				</div>
			</div>
			<div
				on:click={() =>
					routerInstance.goTo(RegisterRoutes.Owner, {
						id: Roles.Producer.Id,
					})}
				class="mx-0 lg:w-1/3 py-2 overflow-x-auto sm:px-6 lg:px-8 w-full lg:ml-3
        lg:mr-3 inline-block hover:bg-gray-100 bg-white shadow lg:block flex
        cursor-pointer flex-wrap text-left justify-between lg:mb-0 mb-3"
			>
				<p
					class="hidden lg:block font-semibold uppercase tracking-wide
          text-center text-xl mb-5 py-2 rounded"
				>
					Je suis
					<span class="text-accent">producteur</span>
				</p>
				<img src="/img/producer.svg" alt="Image producteur" class="w-2/12 lg:w-3/4 lg:m-auto ml-2" />
				<div class="w-8/12 lg:w-full ml-3 lg:ml-0 lg:text-center">
					<p class="block lg:hidden font-semibold uppercase tracking-wide">
						Je suis
						<span class="text-accent">producteur</span>
					</p>
					<p class="lg:mt-5 mt-2 lg:text-lg">
						Je souhaite permettre à des consommateurs et à des commercants de me trouver et de commander mes
						produits.
					</p>
				</div>
				<div class="block lg:hidden w-1/12 flex items-center -my-2">
					<Icon data={faChevronRight} class="text-normal m-auto" />
				</div>
			</div>
			<div
				on:click={() =>
					routerInstance.goTo(RegisterRoutes.Owner, {
						id: Roles.Store.Id,
					})}
				class="mx-0 lg:w-1/3 py-2 overflow-x-auto sm:px-6 lg:px-8 w-full
        inline-block hover:bg-gray-100 bg-white shadow lg:block flex
        cursor-pointer flex-wrap text-left justify-between lg:mb-0 mb-3"
			>
				<p
					class="hidden lg:block font-semibold uppercase tracking-wide
          text-center text-xl mb-5 py-2 rounded"
				>
					Je suis
					<span class="text-accent">commerçant</span>
				</p>
				<img
					src="/img/shop.svg"
					style="max-width: 129px;"
					alt="Image commerçant"
					class="w-2/12 lg:w-3/4 lg:m-auto ml-2"
				/>
				<div class="w-8/12 lg:w-full ml-3 lg:ml-0 lg:text-center">
					<p class="block lg:hidden font-semibold uppercase tracking-wide">
						Je suis
						<span class="text-accent">commerçant</span>
					</p>
					<p class="lg:mt-5 mt-2 lg:text-lg">
						Je possède un commerce ou un restaurant et souhaite passer des commandes régulièrement aux
						producteurs locaux.
					</p>
				</div>
				<div class="block lg:hidden w-1/12 flex items-center -my-2">
					<Icon data={faChevronRight} class="text-normal m-auto" />
				</div>
			</div>
		</div>
	</div>
</TransitionWrapper>
