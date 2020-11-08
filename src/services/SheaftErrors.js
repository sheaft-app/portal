import Guid from "./../helpers/Guid";
import { errors } from "./../stores/errors";
import { get } from "svelte/store";

class SheaftErrors {
	constructor(notifManager) {
		this.notifications = notifManager;
		this.Uuid = Guid.NewGuid();
	}

	handleUuidErrors(newErrors, uuid) {
		if (!newErrors || newErrors.length < 1) return;

		var newErr = [];
		newErrors.forEach((error) => {
			var custErrors = [];
			if (!error.message) error.message = "Une erreur inattendue est survenue";

			if (error.extensions && error.extensions.code) {
				custErrors.push({
					code: error.extensions.code,
					message: error.extensions[error.extensions.code],
					identifier: error.extensions.RequestIdentifier,
					error
				});
			} else custErrors.push(error);

			custErrors.forEach((ce) => {
				if (uuid) newErr.push({ ...ce, uuid });
				else newErr.push(ce);
			});
		});

		errors.set([...get(errors), ...newErr]);
	}

	clearErrors(uuid) {
		if (!uuid) return;

		var err = get(errors);
		errors.set(err.filter((e) => e.uuid != uuid));
	}

	getErrors() {
		var err = get(errors);
		if (err.length < 1) return [];

		return err.filter((e) => e.uuid == this.Uuid);
	}
}

export default SheaftErrors;
