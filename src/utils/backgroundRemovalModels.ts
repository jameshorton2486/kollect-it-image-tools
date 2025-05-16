
export interface BackgroundRemovalModel {
  id: string;
  name: string;
  description: string;
  selfHostedSupport: boolean;
  apiSupport: boolean;
  browserSupport?: boolean;
  customizationLevel?: 'none' | 'basic' | 'advanced';
}

export const BACKGROUND_REMOVAL_MODELS: BackgroundRemovalModel[] = [
  {
    id: 'removebg',
    name: 'Remove.bg API',
    description: 'Professional background removal service with high accuracy',
    selfHostedSupport: false,
    apiSupport: true,
    customizationLevel: 'none'
  },
  {
    id: 'rembg',
    name: 'Rembg (U2Net)',
    description: 'Open-source background removal using U2Net model',
    selfHostedSupport: true,
    apiSupport: false,
    customizationLevel: 'basic'
  },
  {
    id: 'briaai',
    name: 'BRIA AI',
    description: 'High quality AI-powered background removal',
    selfHostedSupport: false,
    apiSupport: true,
    customizationLevel: 'none'
  },
  {
    id: 'browser',
    name: 'In-Browser',
    description: 'Process images directly in your browser - no API needed',
    selfHostedSupport: false,
    apiSupport: false,
    browserSupport: true,
    customizationLevel: 'advanced'
  }
];

export const DEFAULT_BACKGROUND_REMOVAL_MODEL = 'removebg';

export function getModelById(modelId: string): BackgroundRemovalModel {
  return BACKGROUND_REMOVAL_MODELS.find(model => model.id === modelId) || 
    BACKGROUND_REMOVAL_MODELS[0];
}
