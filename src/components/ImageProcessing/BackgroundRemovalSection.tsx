
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BACKGROUND_REMOVAL_MODELS, getModelById } from "@/utils/backgroundRemovalModels";

interface BackgroundRemovalSectionProps {
  removeBackground: boolean;
  apiKey: string | null;
  selfHosted: boolean;
  serverUrl: string;
  backgroundRemovalModel: string;
  onRemoveBackgroundChange: (value: boolean) => void;
  onApiKeyChange: (value: string) => void;
  onSelfHostedChange: (value: boolean) => void;
  onServerUrlChange: (value: string) => void;
  onBackgroundRemovalModelChange: (value: string) => void;
}

const BackgroundRemovalSection: React.FC<BackgroundRemovalSectionProps> = ({
  removeBackground,
  apiKey,
  selfHosted,
  serverUrl,
  backgroundRemovalModel,
  onRemoveBackgroundChange,
  onApiKeyChange,
  onSelfHostedChange,
  onServerUrlChange,
  onBackgroundRemovalModelChange
}) => {
  // Get the current selected model details
  const selectedModel = getModelById(backgroundRemovalModel);
  const showApiKey = removeBackground && !selfHosted && selectedModel.apiSupport;

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-medium mb-3">Background Removal</h3>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Switch
            id="remove-bg"
            checked={removeBackground}
            onCheckedChange={onRemoveBackgroundChange}
          />
          <label
            htmlFor="remove-bg"
            className="text-sm font-medium leading-none"
          >
            Remove background from images
          </label>
        </div>
      </div>
      
      {removeBackground && (
        <div className="space-y-4 pl-2 border-l-2 border-muted p-4 rounded bg-muted/20">
          {/* Model Selection Radio Group */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Select Background Removal Model</h4>
            <RadioGroup 
              defaultValue={backgroundRemovalModel}
              value={backgroundRemovalModel}
              onValueChange={onBackgroundRemovalModelChange}
              className="space-y-2"
            >
              {BACKGROUND_REMOVAL_MODELS.map(model => (
                <div key={model.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={model.id} id={`model-${model.id}`} />
                  <Label htmlFor={`model-${model.id}`} className="font-medium">
                    {model.name}
                  </Label>
                  <span className="text-xs text-muted-foreground">- {model.description}</span>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* Self-hosted Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="self-hosted"
              checked={selfHosted}
              onCheckedChange={(checked) => onSelfHostedChange(checked as boolean)}
              disabled={backgroundRemovalModel !== 'rembg' && !getModelById(backgroundRemovalModel).selfHostedSupport}
            />
            <label
              htmlFor="self-hosted"
              className={`text-sm font-medium leading-none ${
                backgroundRemovalModel !== 'rembg' && !getModelById(backgroundRemovalModel).selfHostedSupport 
                  ? 'text-muted-foreground' 
                  : ''
              }`}
            >
              Use self-hosted Rembg service
            </label>
          </div>
          
          {/* Conditional Input for Server URL or API Key */}
          {selfHosted ? (
            <FormItem>
              <FormLabel>Rembg Server URL</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="http://localhost:5000/remove-bg"
                  value={serverUrl || ''}
                  onChange={(e) => onServerUrlChange(e.target.value)}
                  className="font-mono"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                Enter the URL of your self-hosted Rembg server
              </p>
            </FormItem>
          ) : showApiKey && (
            <FormItem>
              <FormLabel>{selectedModel.name} API Key</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={`Enter your ${selectedModel.name} API key`}
                  value={apiKey || ''}
                  onChange={(e) => onApiKeyChange(e.target.value)}
                  className="font-mono"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedModel.id === 'removebg' && (
                  <>Get your API key from <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer" className="underline">remove.bg/api</a></>
                )}
                {selectedModel.id === 'briaai' && (
                  <>Get your API key from <a href="https://bria.ai" target="_blank" rel="noopener noreferrer" className="underline">bria.ai</a></>
                )}
              </p>
            </FormItem>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundRemovalSection;
