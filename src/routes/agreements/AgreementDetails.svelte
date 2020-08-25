<script>
  import DayOfWeekKind from "./../../enums/DayOfWeekKind.js";
  import AgreementStatusKind from "./../../enums/AgreementStatusKind.js";
  import Loader from "./../../components/Loader.svelte";
  import { onMount, getContext } from "svelte";
  import Icon from "svelte-awesome";
  import { faTruck, faHourglass, faCheck, faMapMarkerAlt, faTimesCircle, faPhone, faEnvelope, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
  import TransitionWrapper from "./../../components/TransitionWrapper.svelte";
  import GetGraphQLInstance from "./../../services/SheaftGraphQL.js";
  import GetAuthInstance from "./../../services/SheaftAuth.js";
  import GetRouterInstance from "./../../services/SheaftRouter";
  import { GET_AGREEMENT_DETAILS } from "./queries";
  import RatingStars from "./../../components/rating/RatingStars.svelte";
  import CancelAgreementModal from "./CancelAgreementModal.svelte";
  import AcceptAgreementModal from "./AcceptAgreementModal.svelte";
  import RefuseAgreementModal from "./RefuseAgreementModal.svelte";
  import SheaftErrors from "../../services/SheaftErrors";
  import ErrorCard from "./../../components/ErrorCard.svelte";
  import AgreementRoutes from "./routes";
  import { timeSpanToFrenchHour } from "./../../helpers/app";

  export let params = {};

  const errorsHandler = new SheaftErrors();
  const authManager = GetAuthInstance();
  const graphQLInstance = GetGraphQLInstance();
  const routerInstance = GetRouterInstance();
  const { open } = getContext("modal");

  let agreement = null;
  let products = [];

  const getAgreement = async id => {
    var res = await graphQLInstance.query(GET_AGREEMENT_DETAILS, {
      id: id
    }, errorsHandler.Uuid);

    if (!res.success) {
      //TODO
      routerInstance.goTo(AgreementRoutes.List);
      return;
    }

    agreement = res.data;
  };

  const showCancelAgreementModal = () => {
    handleAgreementModal(CancelAgreementModal, agreement);
  };

  const showAcceptAgreementModal = () => {
    handleAgreementModal(AcceptAgreementModal, agreement);
  };

  const showRefuseAgreementModal = () => {
    handleAgreementModal(RefuseAgreementModal, agreement);
  };

  const handleAgreementModal = (Modal, obj) => {
    open(Modal, {
      agreement : obj,
      onClose: async res => {
        if (res.success) {
          await getAgreement(agreement.id);
        }
      }
    });
  };

  const isSender = agreement => {
    if (
      agreement.status == AgreementStatusKind.WaitingForProducerApproval.Value &&
      agreement.store.id == authManager.user.profile.company_id
    )
      return true;

    if (
      agreement.status == AgreementStatusKind.WaitingForStoreApproval.Value &&
      agreement.delivery.producer.id == authManager.user.profile.company_id
    )
      return true;

    return false;
  };  

  onMount(async () => {
    await getAgreement(params.id);
  });
</script>

<svelte:head>
  <title>Détails de l'accord</title>
</svelte:head>

<TransitionWrapper>
  <ErrorCard {errorsHandler} />
  {#if !agreement}
    <Loader />
  {:else}
    <section class="mx-0 pb-5">
      <div class="mb-3">
        <button
          class="text-gray-600 items-center flex uppercase"
          on:click={() => routerInstance.goTo(AgreementRoutes.List)}>
          <Icon data={faChevronLeft} scale=".8" class="mr-2 inline" />
          Accords
        </button>
      </div>
      <div class="flex flex-wrap items-center">
        <div>
          <h1 class="text-2xl lg:text-3xl mb-0">Détails de l'accord</h1>
        </div>
      </div>
    </section>
    <div class="w-full xl:w-8/12">
      {#if agreement.status == 'ACCEPTED'}
        <div
          class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-green-100 shadow
          md:rounded md:mb-2">
          <div>
            <p class="uppercase font-bold leading-none">Accord actif</p>
            <div class="mt-2">
              Cet accord est actif. Vous pouvez le révoquer à tout moment en
              cliquant sur le bouton ci-dessous.
            </div>
            <div class="mt-2">
              <a
                href="javascript:void(0)"
                on:click={showCancelAgreementModal}>
                Révoquer l'accord
              </a>
            </div>
          </div>
        </div>
      {/if}
      {#if agreement.status == 'CANCELLED'}
        <div
          class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-gray-100
          shadow md:rounded md:mb-2">
          <p class="uppercase font-bold leading-none">Accord annulé</p>
          <div class="mt-2">
            {#if agreement.reason}
              <p>Cet accord a été annulé pour la raison suivante :</p>
              <p class="mt-2 font-semibold">{agreement.reason}</p>
            {:else}
              <p>
                Cet accord a été annulé, vous ne pouvez plus interagir avec.
              </p>
            {/if}
          </div>
        </div>
      {/if}
      {#if agreement.status == 'REFUSED'}
        <div
          class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-red-100
          shadow md:rounded md:mb-2">
          <p class="uppercase font-bold leading-none">Accord refusé</p>
          <div class="mt-2">
            {#if agreement.reason}
              <p>Cet accord a été refusé pour la raison suivante :</p>
              <p>{agreement.reason}</p>
            {:else}
              <p>Cet accord a été refusé.</p>
            {/if}
          </div>
        </div>
      {/if}
      {#if agreement.status.indexOf('WAITING') > -1}
        <div
          class="py-5 px-3 md:px-8 overflow-x-auto -mx-4 md:mx-0 bg-blue-100 shadow
          md:rounded md:mb-2">
          <p class="uppercase font-bold leading-none">
            Cet accord est en attente de traitement.
          </p>
          {#if !isSender(agreement)}
            <div class="mt-3 flex">
              <button
                on:click={showAcceptAgreementModal}
                class="btn btn-accent btn-lg shadow mr-2">
                Accepter
              </button>
              <button
                on:click={showRefuseAgreementModal}
                class="btn bg-red-500 text-white btn-lg shadow">
                Refuser
              </button>
            </div>
          {/if}
        </div>
      {/if}
      <div class="flex flex-wrap -mx-4 md:mx-0">
        <div class="w-full lg:w-1/2 lg:pr-1">
          <div class="relative">
            <div class="bg-white p-6 md:rounded md:shadow border-t border-gray-400 md:border-none">
              <div class="flex items-baseline">
                <div
                  class="text-gray-600 text-xs uppercase font-semibold
                  tracking-wide">
                  Producteur
                </div>
              </div>
              <h4 class="mt-1 font-semibold text-lg leading-tight truncate">
                {agreement.delivery.producer.name}
              </h4>
              <div class="mt-1">
                <p class="text-base mb-1">
                  <Icon
                    data={faPhone}
                    class="mr-1 inline"
                    style="margin-bottom: 1px; width: 20px;" />
                  {#if agreement.delivery.producer.phone}
                    <a href="tel:{agreement.delivery.producer.phone}">
                      {agreement.delivery.producer.phone}
                    </a>
                  {:else}Non renseigné{/if}
                </p>
                <p class="text-base mb-1">
                  <Icon
                    data={faEnvelope}
                    class="mr-1 inline"
                    style="margin-bottom: 3px; width: 20px;" />
                  <a href="mailto:{agreement.delivery.producer.email}">
                    {agreement.delivery.producer.email}
                  </a>
                </p>
                <div class="text-base flex">
                  <Icon
                    data={faMapMarkerAlt}
                    class="mr-2 inline"
                    style="margin-bottom: 3px; width: 20px;" />
                  <div class="leading-none">
                    <div class="mb-1">
                      {agreement.delivery.producer.address.line1}
                    </div>
                    {#if agreement.delivery.producer.address.line2}
                      <div>{agreement.delivery.producer.address.line2}</div>
                    {/if}
                    <div>
                      {agreement.delivery.producer.address.zipcode}
                      {agreement.delivery.producer.address.city}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full lg:w-1/2">
          <div class="relative">
            <div class="bg-white p-6 md:rounded md:shadow border-t border-gray-400 md:border-none">
              <div class="flex items-baseline">
                <div
                  class="text-gray-600 text-xs uppercase font-semibold
                  tracking-wide">
                  Magasin
                </div>
              </div>
              <h4 class="mt-1 font-semibold text-lg leading-tight truncate">
                {agreement.store.name}
              </h4>
              <div class="mt-1">
                <p class="text-base mb-1">
                  <Icon
                    data={faPhone}
                    class="mr-1 inline"
                    style="margin-bottom: 1px; width: 20px;" />
                  {#if agreement.store.phone}
                    <a href="tel:{agreement.store.phone}">
                      {agreement.store.phone}
                    </a>
                  {:else}Non renseigné{/if}
                </p>
                <p class="text-base mb-1">
                  <Icon
                    data={faEnvelope}
                    class="mr-1 inline"
                    style="margin-bottom: 3px; width: 20px;" />
                  <a href="mailto:{agreement.store.email}">
                    {agreement.store.email}
                  </a>
                </p>
                <div class="text-base flex">
                  <Icon
                    data={faMapMarkerAlt}
                    class="mr-2 inline"
                    style="margin-bottom: 3px; width: 20px;" />
                  <div class="leading-none">
                    <div class="mb-1">{agreement.store.address.line1}</div>
                    {#if agreement.store.address.line2}
                      <div>{agreement.store.address.line2}</div>
                    {/if}
                    <div>
                      {agreement.store.address.zipcode}
                      {agreement.store.address.city}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {#if agreement.selectedHours.length > 0}
          <div
            class="p-6 overflow-x-auto bg-white md:shadow md:rounded w-full md:mt-2 border-t border-b border-gray-400 md:border-none">
            <div class="flex">
              <Icon data={faTruck} scale="1.3" class="mr-5" />
              <div>
                <p class="uppercase font-bold leading-none mb-2">
                  Créneaux de livraison choisis :
                </p>
                {#each agreement.selectedHours as selectedHour}
                  <div class="mb-2">
                    <p style="min-width: 100px;">
                      Le {DayOfWeekKind.label(selectedHour.day).toLowerCase()}
                      <span>
                        {`entre ${timeSpanToFrenchHour(selectedHour.from)} et ${timeSpanToFrenchHour(selectedHour.to)}`}
                      </span>
                    </p>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>
      <div class="px-0 md:px-5 overflow-x-auto -mx-4 md:-mx-5 mb-5 mt-5">
        <div
          class="flex flex-wrap bg-white w-full lg:w-auto px-4 lg:px-8 shadow">
          <div class="w-full">
            <section>
              <div class="-mx-4 lg:-mx-8">
                {#each products as product, index}
                  <div
                    style="margin-bottom:1px;"
                    class="rounded hover:bg-gray-100 transition duration-200
                    ease-in-out focus:outline-none">
                    <div class="h-full bg-white border-gray-400 border-b">
                      <div class="relative p-4 w-full">
                        <div
                          class="bg-white rounded p-0 w-full flex
                          justify-between">
                          <div class="pr-8">
                            <h4
                              class="font-semibold text-base lg:text-lg
                              leading-tight -mb-2 lg:mb-0">
                              {product.name}
                            </h4>
                            <div class="mt-2 md:mt-0 w-full text-xs">
                              <RatingStars rating={product.rating} />
                              <span class="text-gray-600">
                                {product.rating || 'Aucun avis'}
                              </span>
                            </div>
                          </div>
                          <div class="text-base text-right font-semibold">
                            {product.wholeSalePricePerUnit}€ H.T
                            <div class="text-xs">
                              ({`${product.quantityPerUnit}${product.unit}`})
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  {/if}
</TransitionWrapper>
