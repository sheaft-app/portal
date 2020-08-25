<script>
  export let close;
</script>

<div class="flex flex-wrap flex-row -my-2 lg:-my-4 -mx-6 lg:mx-0">
  <div class="lg:-mx-6 lg:-my-4 image w-full lg:w-1/3 lg:rounded-lg"></div>
  <div class="w-full lg:w-2/3 lg:pl-12 pt-6 px-6 lg:px-0 rounded-t-lg lg:rounded-none">
    <h2 class="font-semibold">Frais de paiement bancaire, késako ?</h2>
    <span class="bg-primary h-1 w-20 block mt-2 mb-4"></span>
    <p>Nous utilisons Stripe, un service de paiement externe qui assure la sécurité des transactions.</p>
    <p><b>Sheaft ne touche pas un seul centime de ces frais</b>. Ils ne servent qu'à opérer la transaction de manière 100% chiffrée et sécurisée et garantir ainsi la sécurité de vos données bancaires.</p>
    <p>Ces frais sont comparables à ceux appliqués sur le terminal de paiement d'un commerçant ou d'un producteur.</p>
    <p>La méthode de calcul des frais est la suivante : 1.4% du panier total + 0.25€</p>
    <p>Ainsi pour un panier de 20€, on ajoutera 0.53 centimes pour couvrir les frais de paiement sécurisé.</p>
    <p>Toutes les informations de Stripe sont disponibles sur leur site web : <a target="_blank" href="https://stripe.com/fr">www.stripe.com</a></p>
    <button type="button" on:click={close} class="btn btn-accent btn-lg mt-5 mb-5">Fermer</button>
  </div>
</div>

<style lang="scss">
p {
  @apply mb-2;
  @apply text-lg;
}

.image {
  height: 180px;
  background-image: url(./img/stock/payment.jpg);
  background-size: cover;
  background-position: center;

  @media (min-width: 768px) {
    height: 465px;
  }
}
</style>