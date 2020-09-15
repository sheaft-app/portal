import { afterUpdate } from 'svelte';
import { writable, get } from 'svelte/store';
import * as rules from './rules';

function getValue(field) {
  if (field.data) {
    return field.data.value;
  }

  return field.value;
}

function isPromise(obj) {
  // Standard promise API always has a `then` method
  return !!obj.then;
}

function validate(fieldName, value, validator, observable, enabled = true) {
  let valid = true;
  let pending = false;
  let rule;

  if (enabled === false) {
    return [valid, rule, pending];
  } else if (typeof validator === 'function') {
    const resp = validator.call(null, value);

    if (isPromise(resp)) {
      pending = true;
      resp.then(({ name, valid }) => {
        observable.update((n) => {
          n.fields[fieldName] = n.fields[fieldName] || { errors: [] };

          n.fields[fieldName].pending = false;
          n.fields[fieldName].valid = valid;

          if (!valid) {
            n.fields[fieldName].errors.push(name);
          }

          n.valid = !Object.keys(n.fields).find((f) => !n.fields[f].valid);

          return n;
        });
      });
    } else {
      valid = resp.valid;
      rule = resp.name;
    }
  } else {
    const params = validator.split(/:/g);
    rule = params.shift();
    valid = rules[rule].call(null, value, params);
  }

  return [valid, rule, pending];
}

function validateField(data, observable, { stopAtFirstFieldError }) {
  const { name, value, validators = [], enabled = true } = data;
  const context = get(observable);

  let valid = true;
  let pending = false;
  let dirty = context.fields[data.name] ?  context.fields[data.name].dirty : false;
  let errors = [];

  if (enabled) {
    validators.some((validator) => {
      const [isValid, rule, isPending] = validate(
        name,
        value,
        validator,
        observable
      );

      if (!pending && isPending) {
        valid = false;
        pending = true;
      }

      if (!isValid) {
        valid = false;
        errors = [...errors, rule];

        return stopAtFirstFieldError;
      }
    });
  }

  return { data, valid, errors, pending, dirty };
}

export function bindClass(node, data) {
  if (!data) return;

  const key = data.name || node.getAttribute('name');
  const valid = data.valid || 'valid';
  const invalid = data.invalid || 'invalid';

  const unsubscribe = data.form.subscribe((context) => {
    console.log(context);
    if (!context.fields.hasOwnProperty(key)) {
      return;
    }
    const field = context.fields[key];

    if (field.valid) {
      node.classList.add(valid);
      node.classList.remove(invalid);
    } else if (!field.valid && field.dirty) {
      node.classList.remove(valid);
      node.classList.add(invalid);
    }
  });

  return {
    destroy: unsubscribe
  };
}

export function form(fn, config = {}) {
  const fields = fn.call();
  const initialFieldsData = Object.fromEntries(
    Object.keys(fields).map((key) => [
      key,
      { name: fields[key].name || key, value: fields[key].value, dirty: false }
    ])
  );

  const storeValue = writable({
    fields: {},
    oldFields: {},
    dirty: false,
    valid: true
  });
  const { subscribe, set, update } = storeValue;
  config = Object.assign(
    {
      initCheck: true,
      validateOnChange: true,
      stopAtFirstError: false,
      stopAtFirstFieldError: true
    },
    config
  );

  if (config.validateOnChange) {
    afterUpdate(() =>
      walkThroughFields(fn, storeValue, initialFieldsData, config)
    );
  }

  if (config.initCheck) {
    walkThroughFields(fn, storeValue, initialFieldsData, config);
  }

  return {
    subscribe,
    set,
    update,

    async validate() {
      await walkThroughFields(fn, storeValue, initialFieldsData, config, true);
      
      const domErrors = document.getElementsByClassName('invalid');
      if (domErrors.length >= 1)
        scrollToTargetAdjusted(domErrors[0]);
    }
  };
}

async function walkThroughFields(fn, observable, initialFieldsData, config, forceDirty = false) {
  const fields = fn.call();
  const context = get(observable);
  const returnedObject = {
    fields: {},
    oldFields: {},
    dirty: false
  };

  Object.keys(fields).some((key) => {
    const field = {
      name: key,
      ...fields[key]
    };
    const oldField = context.fields[key] || {
      data: {},
      errors: [],
      pending: false,
      valid: false,
      enabled: true
    };
    const initialFieldData = initialFieldsData[key];

    const value = getValue(field);
    const oldValue = getValue(oldField);
    const enabled = field.enabled;
    const oldEnabled = oldField.enabled;

    if (enabled !== oldEnabled || value !== oldValue) {
      returnedObject.fields[key] = validateField(field, observable, config);
    } else {
      returnedObject.fields[key] = context.fields[key];

      if (!enabled) {
        returnedObject.fields[key].valid = true;
        returnedObject.fields[key].errors = [];
      }
    }

    if (value !== initialFieldData.value || forceDirty) {
      returnedObject.fields[key].dirty = true;
      returnedObject.dirty = true;
    }

    returnedObject.oldFields[key] = Object.assign({}, oldField);

    if (config.stopAtFirstError) {
      return !returnedObject.fields[key].valid;
    }
  });

  returnedObject.valid = !Object.keys(returnedObject.fields).find(
    (f) => returnedObject.fields[f] && !returnedObject.fields[f].valid
  );

  observable.set(returnedObject);
}

const scrollToTargetAdjusted = (element) => {
	var headerOffset = document.getElementById('navbar').offsetHeight;
	var elementPosition = element.offsetTop;
  var offsetPosition = elementPosition - headerOffset;
  
	window.scrollTo({
			top: offsetPosition,
			behavior: "smooth"
	});   
}