export const visibilityStates = ref({
  password: false,
  confirmPassword: false,
});

export const toggleVisibility = (field: keyof typeof visibilityStates.value) => {
  visibilityStates.value[field] = !visibilityStates.value[field];
};
