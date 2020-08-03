<script>
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import Loader from "./../../components/Loader.svelte";
  import { onMount } from "svelte";
  import GetAuthInstance from "./../../services/SheaftAuth";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL";
  import Icon from "svelte-awesome";
  import { faCrown } from "@fortawesome/free-solid-svg-icons";
  import {
    POINTS_PER_COUNTRY,
    POINTS_PER_REGION,
    USER_POINTS_PER_COUNTRY,
    USER_POSITION_IN_COUNTRY
  } from "./queries.js";

  export let params;

  const authInstance = GetAuthInstance();
  const graphQLInstance = GetGraphQLInstance();

  $: country = null;
  $: groups = [];
  $: users = [];

  let userPosition = null;
  let isLoading = false;
  let showUserPosition = false;

  const getPointsPerCountry = async () => {
    var res = await graphQLInstance.query(POINTS_PER_COUNTRY);
    if(!res.success){
      //TODO
      return;
    }

    country = res.data[0];
  }

  const getPointsPerRegion = async () => {
    var res = await graphQLInstance.query(POINTS_PER_REGION);
    if(!res.success){
      //TODO
      return;
    }
    groups = res.data;
  }

  const getUserPointsPerCountry  = async () => {
    var res = await graphQLInstance.query(USER_POINTS_PER_COUNTRY);
    if(!res.success){
      //TODO
      return;
    }
    users = res.data;
  }

  const getUserPositionInCountry  = async () => {
    if (!authInstance.authenticated) return;
    
    userPosition = {
        userId: authInstance.user.profile.sub,
        name: authInstance.user.profile.given_name,
        points: null,
        position: null
      };
      
    var res = await graphQLInstance.query(USER_POSITION_IN_COUNTRY);
    if(!res.success){
      showUserPosition = false;
      return;
    }

    userPosition.points = res.data.points;
    userPosition.position = res.data.position;
    showUserPosition = users.filter(c => c.userId == authInstance.user.profile.sub).length == 0;
  }

  const getUserPicture = (user) => {
    if (user.picture) return user.picture;
    return "https://sheaftapp.blob.core.windows.net/pictures/users/profile.svg";
  }

  const getUserName = (user) => {
    if (user.name) return user.name;
    return "Anonyme";
  }

  onMount(async () => {
    isLoading = true;
    await getPointsPerCountry();
    await getPointsPerRegion();
    await getUserPointsPerCountry();
    await getUserPositionInCountry();
    isLoading = true;
  });
</script>

<svelte:head>
  <title>Classement national</title>
</svelte:head>

<TransitionWrapper>
  {#if !country}
    <Loader />
  {:else if country && country.points > 0}
    <div class="h-full">
      <h2 class="text-gray-800 font-semibold uppercase text-center">France</h2>
      <h2 class="text-yellow-500 font-semibold uppercase text-center">
        <Icon data={faCrown} class="mr-2" scale="1.2" />
        {country.points}
      </h2>
      <div class="flex flex-wrap">
        <div class="w-full md:w-1/2 md:pr-10 ">
          <p
            class="bg-white rounded-full shadow uppercase font-semibold px-3
            py-2 text-center my-2">
            Top régions
          </p>
          {#each groups as group}
            <div
              class="flex justify-between border-b border-gray-400 border-solid
              py-4">
              <div class="inline-flex items-center">
                <p class="leading-none font-semibold">{group.regionName}</p>
              </div>
              <p class="text-yellow-500">
                <Icon data={faCrown} class="mr-2" />
                {group.points}
              </p>
            </div>
          {/each}
        </div>
        <div class="w-full md:w-1/2 md:pl-10 pt-12 md:pt-0">
          <p
            class="bg-white rounded-full shadow uppercase font-semibold px-3
            py-2 text-center my-2">
            Top consommateurs
          </p>
          {#each users as user}
            <div
              class="flex justify-between border-b border-gray-400 border-solid
              py-4">
              <div class="inline-flex">
                <div
                  class="flex items-center font-semibold"
                  style="min-width:35px">
                  <p class="">{user.position} -</p>
                </div>
                <div
                  class="rounded-full w-8 h-8 mr-2"
                  style="background:url('{getUserPicture(user)}') center center
                  / cover;" />
                <div class="flex items-center">
                  <p class="leading-none font-semibold">{getUserName(user)}</p>
                </div>
              </div>
              <p class="text-yellow-500">
                <Icon data={faCrown} class="mr-2" />
                {user.points}
              </p>
            </div>
          {/each}
          {#if showUserPosition}
            <div
              class="flex justify-between border-b border-gray-400 border-solid
              py-4">
              <div class="inline-flex">
                <p>...</p>
              </div>
            </div>
            <div
              class="flex justify-between border-b border-gray-400 border-solid
              py-4">
              <div class="inline-flex">
                <div
                  class="flex items-center font-semibold"
                  style="min-width:35px">
                  <p class="">{userPosition.position} -</p>
                </div>
                <div
                  class="rounded-full w-8 h-8 mr-2"
                  style="background:url('{getUserPicture(userPosition)}') center
                  center / cover;" />
                <div class="flex items-center">
                  <p class="leading-none font-semibold">
                    {getUserName(userPosition)}
                  </p>
                </div>
              </div>
              <p class="text-yellow-500">
                <Icon data={faCrown} class="mr-2" />
                {userPosition.points}
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="w-full h-full flex justify-center">
      <div class="text-center text-xl text-gray-600 m-auto px-6">
        <p>A vos marques ? Prêt ? Partez !</p>
        <p class="mb-5">
          Dès que les premiers points seront attribués, vous verrez s'afficher
          les scores.
        </p>
        <img
          src="/img/no_ranking.svg"
          class="m-auto"
          style="width: 200px; height: auto"
          alt="Aucun point distribué" />
      </div>
    </div>
  {/if}
</TransitionWrapper>
