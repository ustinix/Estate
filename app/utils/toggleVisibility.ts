export const visibilityStates = reactive({
  password: false,
  confirmPassword: false,
  currentPassword: false,
  newPassword: false,
});

export const toggleVisibility = (field: keyof typeof visibilityStates) => {
  visibilityStates[field] = !visibilityStates[field];
};
