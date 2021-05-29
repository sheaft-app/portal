import { getDefaultFields } from "../../stores/form";
import omit from "lodash/omit";

export const initialValues = {
    id: null,
    firstName: null,
    lastName: null,
    email: null
};

export const validators = (consumer) => ({
    ...getDefaultFields(consumer, initialValues),
    email: { value: consumer.email, validators: ['required', 'email'], enabled: true },
});

export const normalizeConsumer = consumer => omit({
        ...consumer
});
