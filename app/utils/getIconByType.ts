import { propertyTypes } from '~/constants/portfolio';

export const getIconByType = (typeName: string): string => {
  const type = propertyTypes.find(t => t.name === typeName);
  return type?.icon || 'help_outline';
};
