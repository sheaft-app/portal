<script>
  import { format } from "date-fns";
  import fr from "date-fns/locale/fr";
  import { onMount } from "svelte";
  import cart from "./../../stores/cart";
	import Loader from "../../components/Loader.svelte";
  import { formatMoney } from "./../../helpers/app.js";
  import GetRouterInstance from "../../services/SheaftRouter";
  import Icon from "svelte-awesome";
  import CartRoutes from "./routes";
  import { faUser, faMapMarkerAlt, faEdit, faFlag, faHeart } from "@fortawesome/free-solid-svg-icons";
  import { fly } from "svelte/transition";
  import DeliveryAddress from "./DeliveryAddress.svelte";
  import PaymentForm from "./PaymentForm.svelte";

  const routerInstance = GetRouterInstance();

  export let step = 2, user, card = null, invalidPaymentForm = false;

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

{#if !user}
  <Loader />
{:else}
  <div in:fly|local={{ x: 300, duration: 300 }}>
    <div class="px-5 mt-3 lg:mt-0 md:px-0 mb-6">
      <h1 class="font-semibold uppercase mb-0">Vérification et paiement</h1>
      <span class="bg-primary h-1 w-20 block mt-2"></span>
    </div>
    <div class="bg-white shadow px-5 py-3 lg:rounded">
      {#if $cart.donation !== 0}
        <div class="-my-3 -mx-5 px-5 py-3 mb-4 bg-accent lg:rounded-t font-semibold items-center flex">
          <Icon data={faHeart} class="mr-3" />
          {#if $cart.donation == 1}
            <span>Vous êtes extraordinaire !</span>
          {:else}
            <span>Merci beaucoup !</span>
          {/if}
        </div>
        {#if $cart.donation == 1}
          <p>Merci beaucoup, votre contribution de {formatMoney($cart.donation || 0)} est un très gros coup de pouce et représente beaucoup pour nous ! 😍</p>
        {:else}
          <p>Votre contribution de {formatMoney($cart.donation || 0)} représente beaucoup pour nous 😊</p>
        {/if}
        <p>Sheaft vit grâce aux personnes comme vous qui contribuent à son fonctionnement.</p>
        <button class="btn btn-link mt-2" on:click={() => routerInstance.goTo({ 
          Path: CartRoutes.Resume.Path, 
          Params: {
            Query: {
              step: "donation"
            }
          }
        })}>Je souhaite modifier mon don</button>
      {:else}
        <div class="-my-3 -mx-5 px-5 py-3 mb-4 bg-white shadow lg:rounded-t font-semibold items-center flex">
          <Icon data={faHeart} class="mr-3 text-red-500" />
          <span>Sheaft ne vit que par les dons</span>
        </div>
        <p>Sheaft ne gagne pas d'argent. Nous sommes une association qui propose un outil gratuit pour les consommateurs ET les producteurs.</p>
        <p>Donner à Sheaft, c'est s'engager dans le développement de l'économie locale en donnant une chance à un petit projet de devenir grand.</p>
        <button class="btn btn-accent btn-lg mt-2" on:click={() => routerInstance.goTo({ 
          Path: CartRoutes.Resume.Path, 
          Params: {
            Query: {
              step: "donation"
            }
          }
        })}>Je veux faire un don</button>
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
      <div class="flex leading-none">
        <Icon data={faMapMarkerAlt} class="mr-4 rounded-full bg-primary py-2 w-8 h-8"/>
        <div>
          <p>{user.address.line1}</p>
          {#if user.address.line2}
            <p style="line-height: 1.8;">{user.address.line2}</p>
          {/if}
          <p style="line-height: 1.8;">{user.address.zipcode} {user.address.city}</p>
        </div>
      </div>
    </div>

    <div class="bg-white shadow lg:rounded lg:mt-5 lg:mb-5">
      <div class="px-5 py-3 bg-gray-100 border-b border-gray-400 lg:rounded-t font-semibold flex justify-between items-center">
        <p>Panier</p>
        <button class="btn btn-link items-center" on:click={() => routerInstance.goTo(CartRoutes.Resume)}>
          <Icon data={faEdit} class="mr-1" />
          <span>Modifier</span>
        </button>
      </div>

      {#each cart.getSortedProductsByProducerName($cart.products) as product, i (product.id)}
        <div>
          {#if i === 0 || cart.getSortedProductsByProducerName()[i - 1].producer.name !== product.producer.name}
            <DeliveryAddress producerName={product.producer.name} producerId={product.producer.id} />
          {/if}
          {#if !product.disabled && !product.producer.disabled}
            <div
            class="px-2 md:px-3 py-4 block md:flex md:flex-row bg-white border-b
            border-gray-400 border-solid items-center" >
              <div class="md:w-6/12 px-3">
                <div class="text-lg leading-5 font-medium">
                  <p>{product.name}</p>
                </div>
                <div class="text-sm leading-5">{formatMoney(product.unitOnSalePrice)} / unité</div>
              </div>
              <div class="px-3 block md:hidden">
                <p>
                  <span>x{product.quantity} : </span>
                  <span class="font-bold text-lg">
                    {formatMoney(product.unitOnSalePrice * product.quantity || 0)}
                  </span>
                </p>
              </div>
              <div class="md:w-6/12 px-3 text-right hidden md:block">
                <p>
                  <span class="text-sm">x{product.quantity} : </span>
                  <span class="font-bold">
                    {formatMoney(product.unitOnSalePrice * product.quantity || 0)}
                  </span>
                </p>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}