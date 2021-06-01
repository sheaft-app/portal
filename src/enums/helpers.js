const GetEnumObjectFor = (enums, propertyValue) => {
	var defaultEnum = {
		Label: "",
		Icon: null,
		Color: null,
		Value: null,
	};

	if (enums == null) {
		return defaultEnum;
	}

	var enumValue = Object.keys(enums).find((key) => enums[key].Value == propertyValue);
	if (enumValue == null) return defaultEnum;

	return enums[enumValue];
};

export default GetEnumObjectFor;
