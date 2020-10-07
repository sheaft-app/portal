<script>
  import { onMount } from "svelte";
  import { cartItems } from "./../../stores/app";
	import Loader from "../../components/Loader.svelte";
  import { formatMoney } from "./../../helpers/app.js";
  import GetRouterInstance from "../../services/SheaftRouter";
  import Icon from "svelte-awesome";
  import CartRoutes from "./routes";
  import { faUser, faMapMarkerAlt, faEdit, faFlag, faHeart } from "@fortawesome/free-solid-svg-icons";
  import { fly } from "svelte/transition";
  import { format } from "date-fns";
  import { fr } from "date-fns/locale";

  const routerInstance = GetRouterInstance();

  export let step = 2, user, order;
  
  // si la date n'est pas un objet date
  if (user.birthDate && user.birthDate.includes("/")) {
    const dateParts = user.birthDate.trim().split("/");
    user.birthDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
  }
  
  onMount(() => {
    if (typeof user.countryOfResidence == 'object') { user.countryOfResidence = user.countryOfResidence.code }
    if (typeof user.nationality == 'object') { user.nationality = user.nationality.code }
  })
</script>

{#if !user || !order}
  <Loader />
{:else}
  <div in:fly|local={{ x: 300, duration: 300 }}>
      <div class="bg-white shadow px-5 py-3 lg:rounded">
        {#if order.donation !== 0}
          <div class="-my-3 -mx-5 px-5 py-3 mb-4 bg-accent lg:rounded-t font-semibold items-center flex">
            <Icon data={faHeart} class="mr-3" />
            <span>Vous êtes extraordinaire !</span>
          </div>
          <p>Votre contribution de {formatMoney(order.donation || 0)} représente beaucoup pour nous.</p>
          <p>Sheaft vit grâce aux personnes comme vous qui contribuent à son fonctionnement.</p>
          <button class="btn btn-link mt-2" on:click={() => routerInstance.goTo(CartRoutes.Resume)}>Je souhaite modifier mon don</button>
        {:else}
          <div class="-my-3 -mx-5 px-5 py-3 mb-4 bg-white shadow lg:rounded-t font-semibold items-center flex">
            <Icon data={faHeart} class="mr-3 text-red-500" />
            <span>Sheaft ne vit que par les dons</span>
          </div>
          <p>Sheaft ne gagne pas d'argent. Nous sommes une association qui proposons un outil gratuit pour vous permettre de bien manger plus facilement.</p>
          <p>Donner à Sheaft, c'est s'engager dans le développement de l'économie locale en donnant une chance à un petit projet de devenir grand.</p>
          <button class="btn btn-accent btn-lg mt-2" on:click={() => {}}>Faire l'arrondi pour Sheaft ({formatMoney(Math.ceil(order.totalPrice) - order.totalPrice)})</button>
        {/if}
      </div>
    <div class="bg-white shadow px-5 py-3 lg:rounded lg:mt-5">
      <div class="-my-3 -mx-5 px-5 py-3 mb-4 bg-gray-100 border-b border-gray-400 lg:rounded-t font-semibold flex justify-between items-center">
        <p>Informations facturation</p>
        <button class="btn btn-link items-center" on:click={() => step = 1}>
          <Icon data={faEdit} class="mr-1" />
          <span>Modifier</span>
        </button>
      </div>
      <div class="flex leading-none mb-5">
        <Icon data={faUser} class="mr-4 rounded-full bg-primary py-2 w-8 h-8" />
        <div>
          <p>{user.firstName} {user.lastName}</p>
          <p style="line-height: 1.8;">né le 
            {format(
              new Date(user.birthDate),
              'PPP',
              {
                locale: fr
              }
            )}
          </p>
          <p>{user.email}</p>
        </div>
      </div>
      <div class="flex leading-none mb-5">
        <Icon data={faMapMarkerAlt} class="mr-4 rounded-full bg-primary py-2 w-8 h-8"/>
        <div>
          <p>{user.address.line1}</p>
          {#if user.address.line2}
            <p class="line-height: 1.8;">{user.address.line2}</p>
          {/if}
          <p style="line-height: 1.8;">{user.address.zipcode} {user.address.city}</p>
        </div>
      </div>
      <div class="flex leading-none">
        <Icon data={faFlag} class="mr-4 rounded-full bg-primary py-2 w-8 h-8"/>
        <div>
          <p>Nationalité : {user.nationality}</p>
          <p style="line-height: 1.8;">Pays de résidence : {user.countryOfResidence}</p>
        </div>
      </div>
    </div>

    <div class="bg-white shadow px-5 py-3 lg:rounded lg:mt-5">
      <div class="-my-3 -mx-5 px-5 py-3 mb-4 bg-gray-100 border-b border-gray-400 lg:rounded-t font-semibold flex justify-between items-center">
        <p>Panier</p>
        <button class="btn btn-link items-center" on:click={() => routerInstance.goTo(CartRoutes.Resume)}>
          <Icon data={faEdit} class="mr-1" />
          <span>Modifier</span>
        </button>
      </div>
      {#each $cartItems as cartItem, index}
        <div class:bg-gray-100={index % 2 == 1} class="-mx-5 -my-3 px-5 py-3 flex justify-between">
          <div>
            <p class="font-medium">{cartItem.name}</p>
            <p class="text-sm">{cartItem.producer.name}</p>
          </div>
          <div class="text-right">
            <p class="font-medium">{formatMoney(cartItem.onSalePrice)}</p>
            <p class="text-sm">qté : {cartItem.quantity}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}