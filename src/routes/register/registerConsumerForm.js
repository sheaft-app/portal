import { getDefaultFields } from "../../stores/form";

export const initialValues = (auth) => ({
    firstName: auth?.profile?.given_name || null,
    lastName: auth?.profile?.family_name || null,
    email: auth?.profile?.email || null,
    phone: auth?.profile?.phone || null,
    picture: auth?.profile?.picture || null,
    sponsoringCode: JSON.parse(localStorage.getItem("user_sponsoring")) || null
});

export const validators = (values) => ({
    ...getDefaultFields(values, initialValues(), ['phone', 'sponsoringCode', 'picture']),
    email: { value: values.email, validators: ['required', 'email'], enabled: true }
});