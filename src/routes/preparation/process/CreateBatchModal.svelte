<script>
    import ActionConfirm from "../../../components/modal/ActionConfirm.svelte";
    import { CREATE_BATCH } from "../mutations";
    import { getContext } from "svelte";
    import { faCheck } from "@fortawesome/free-solid-svg-icons";
    import SheaftErrors from "../../../services/SheaftErrors";
    import DatePickerWrapper from "./../../../components/controls/DatePickerWrapper.svelte";
    
    export let close, onClose;

    const errorsHandler = new SheaftErrors();
	const { mutate } = getContext("api");

    let batchNumber, expirationDate, isLoading = false;

    const handleSubmit = async () => {
        // todo
        await mutate({
            mutation: CREATE_BATCH,
            variables: { batchNumber, expirationDate },
            errorsHandler,
            success: async (res) => {
                await onClose(res);
                close();
            },
            errorNotification: "Impossible de créer le lot"
        })
    }
</script>

<ActionConfirm
	{errorsHandler}
	title="Créer un lot"
	submit={handleSubmit}
	{isLoading}
    {close}
    valid={batchNumber && expirationDate}
	submitText="Confirmer"
	icon={faCheck}
	closeText="Fermer"
>
<div class="form-control text-left">
    <label for="reason">Numéro du lot *</label>
    <input
        bind:value={batchNumber}
        id="batch"
        type="text"
    />
</div>
<div class="form-control text-left" style="display:block;">
    <label>DLC *</label>
    <DatePickerWrapper bind:selected={expirationDate} dateChosen={true} />
</div>

<small>* champs requis</small>
</ActionConfirm>