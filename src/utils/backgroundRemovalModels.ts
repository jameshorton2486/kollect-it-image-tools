
export interface BackgroundRemovalModel {
  id: string;
  name: string;
  description: string;
  selfHostedSupport: boolean;
  apiSupport: boolean;
}

export const BACKGROUND_REMOVAL_MODELS: BackgroundRemovalModel[] = [
  {
    id: 'removebg',
    name: 'Remove.bg API',
    description: 'Professional background removal service with high accuracy',
    selfHostedSupport: false,
    apiSupport: true
  },
  {
    id: 'rembg',
    name: 'Rembg (U2Net)',
    description: 'Open-source background removal using U2Net model',
    selfHostedSupport: true,
    apiSupport: false
  },
  {
    id: 'briaai',
    name: 'BRIA AI',
    description: 'High quality AI-powered background removal',
    selfHostedSupport: false,
    apiSupport: true
  }
];

export const DEFAULT_BACKGROUND_REMOVAL_MODEL = 'removebg';

export function getModelById(modelId: string): BackgroundRemovalModel {
  return BACKGROUND_REMOVAL_MODELS.find(model => model.id === modelId) || 
    BACKGROUND_REMOVAL_MODELS[0];
}
