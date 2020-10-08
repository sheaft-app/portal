<script>
  import ActionConfirm from "./../../components/modal/ActionConfirm.svelte";
  import SheaftErrors from "./../../services/SheaftErrors";

  const errorsHandler = new SheaftErrors();

  export let onClose, close;

  const handleSubmit = async () => {
    closeModal(true);
  };

  async function closeModal(obj) {
    close();
    if (onClose) await onClose(obj);
  }
</script>

<ActionConfirm
  {errorsHandler}
  title="Des cookies locaux !"
  submit={handleSubmit}
  submitText="J'accepte"
  closeText="Je refuse"
  {close}>
  <p class="text-gray-600">
    Nous utilisons les cookies afin d’améliorer votre experience sur notre site.
    Les cookies sont des données qui sont téléchargées ou stockées sur votre
    appareil.
  </p>
  <p class="text-gray-600 mt-2">
    En cliquant sur ”J’accepte”, vous acceptez l’utilisation de ces cookies.
    Vous pourrez toujours les désactiver ultérieurement.
  </p>
</ActionConfirm>
