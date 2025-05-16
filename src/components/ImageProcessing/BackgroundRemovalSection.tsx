
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BACKGROUND_REMOVAL_MODELS, getModelById } from "@/utils/backgroundRemovalModels";
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const showSelfHostedOption = removeBackground && selectedModel.id === 'rembg';

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
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-medium">Select Background Removal Model</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon size={14} className="text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Choose a model to remove image backgrounds. The browser option works offline but has limited accuracy.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
          
          {/* Self-hosted Option - only show for Rembg */}
          {showSelfHostedOption && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="self-hosted"
                checked={selfHosted}
                onCheckedChange={(checked) => onSelfHostedChange(checked as boolean)}
              />
              <label
                htmlFor="self-hosted"
                className="text-sm font-medium leading-none"
              >
                Use self-hosted Rembg service
              </label>
            </div>
          )}
          
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
          
          {/* In-browser processing note */}
          {backgroundRemovalModel === 'browser' && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800">
                <strong>Browser Processing:</strong> This option processes images entirely within your browser - no API key required. 
                Results may vary depending on image complexity.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundRemovalSection;
