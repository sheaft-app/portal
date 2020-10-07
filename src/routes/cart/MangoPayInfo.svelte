<script>
  export let close;
</script>

<div class="flex flex-wrap flex-row -mx-6 -my-6" style="max-width: 1200px;">
  <div class="image w-full lg:w-1/3 lg:rounded-l-lg lg:rounded-t-lg h-full"></div>
  <div class="w-full lg:w-2/3 px-6 rounded-t-lg lg:rounded-none pt-8">
    <h2 class="font-semibold">Frais de paiement bancaire, késako ?</h2>
    <span class="bg-primary h-1 w-20 block mt-2 mb-4"></span>
    <p>Nous utilisons <a target="_blank" href="https://mangopay.com/fr">MANGOPAY</a>, un service de paiement externe opéré par l'entreprise française Leetchi, qui assure la sécurité des transactions.</p>
    <p><b>Sheaft ne touche pas un seul centime de ces frais</b>. Ils ne servent qu'à opérer la transaction de manière 100% chiffrée et sécurisée et à garantir ainsi la sécurité de vos données bancaires.</p>
    <p>Ces frais sont comparables à ceux appliqués sur le terminal de paiement d'un commerçant ou d'un producteur.</p>
    <p>La méthode de calcul des frais est la suivante : 1,8% du montant total + 0,18€</p>
    <p>Ainsi pour un montant total de 10€, 0,36€ sont ajoutés pour couvrir les frais de paiement sécurisé.</p>
    <button type="button" on:click={close} class="btn btn-lg mt-5 mb-5 border border-gray-400">Fermer</button>
  </div>
</div>

<style lang="scss">
p {
  @apply mb-2;
  @apply text-lg;
}

.image {
  height: auto;
  background-image: url(./img/stock/payment.jpg);
  background-size: cover;
  background-position: center;

  @media (max-width: 1023px) {
    height: 180px;
  }
}
</style>