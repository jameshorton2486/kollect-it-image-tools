
import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BACKGROUND_REMOVAL_MODELS, getModelById } from "@/utils/backgroundRemovalModels";
import { InfoIcon, Eraser, Sliders } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const isBrowserMode = backgroundRemovalModel === 'browser';
  
  // Browser mode advanced settings
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [sensitivityLevel, setSensitivityLevel] = useState(50);
  const [detailLevel, setDetailLevel] = useState(50);
  const [processMethod, setProcessMethod] = useState<'brightness' | 'color' | 'smart'>('brightness');
  
  // Store browser settings in localStorage when changed
  React.useEffect(() => {
    if (isBrowserMode) {
      localStorage.setItem('bg_removal_sensitivity', sensitivityLevel.toString());
      localStorage.setItem('bg_removal_detail', detailLevel.toString());
      localStorage.setItem('bg_removal_method', processMethod);
    }
  }, [sensitivityLevel, detailLevel, processMethod, isBrowserMode]);
  
  // Load saved settings on component mount
  React.useEffect(() => {
    const savedSensitivity = localStorage.getItem('bg_removal_sensitivity');
    const savedDetail = localStorage.getItem('bg_removal_detail');
    const savedMethod = localStorage.getItem('bg_removal_method');
    
    if (savedSensitivity) setSensitivityLevel(parseInt(savedSensitivity, 10));
    if (savedDetail) setDetailLevel(parseInt(savedDetail, 10));
    if (savedMethod && ['brightness', 'color', 'smart'].includes(savedMethod)) {
      setProcessMethod(savedMethod as 'brightness' | 'color' | 'smart');
    }
  }, []);

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
        <Eraser className="h-4 w-4" />
        Background Removal
      </h3>
      
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
          
          {/* Advanced Browser Settings */}
          {isBrowserMode && (
            <Collapsible open={advancedSettingsOpen} onOpenChange={setAdvancedSettingsOpen} className="w-full">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Sliders className="h-4 w-4" />
                  Advanced Settings 
                </h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {advancedSettingsOpen ? "Hide Settings" : "Show Settings"}
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="mt-2 space-y-4">
                {/* Processing Method */}
                <div className="space-y-2">
                  <label className="text-xs font-medium">Processing Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={processMethod === 'brightness' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setProcessMethod('brightness')}
                      className="w-full"
                    >
                      Brightness
                    </Button>
                    <Button
                      variant={processMethod === 'color' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setProcessMethod('color')}
                      className="w-full"
                    >
                      Color
                    </Button>
                    <Button
                      variant={processMethod === 'smart' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setProcessMethod('smart')}
                      className="w-full"
                    >
                      Smart
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {processMethod === 'brightness' && "Removes light-colored backgrounds. Best for white backgrounds."}
                    {processMethod === 'color' && "Detects and removes the most common background color."}
                    {processMethod === 'smart' && "Combines multiple techniques for better results."}
                  </p>
                </div>
                
                {/* Sensitivity Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium">Sensitivity</label>
                    <span className="text-xs text-muted-foreground">{sensitivityLevel}%</span>
                  </div>
                  <Slider
                    value={[sensitivityLevel]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(val) => setSensitivityLevel(val[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher values remove more of the background but may affect the subject.
                  </p>
                </div>
                
                {/* Detail Preservation Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs font-medium">Preserve Details</label>
                    <span className="text-xs text-muted-foreground">{detailLevel}%</span>
                  </div>
                  <Slider
                    value={[detailLevel]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(val) => setDetailLevel(val[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher values preserve more details but may keep some background.
                  </p>
                </div>
                
                {/* Reset Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">Reset to Defaults</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset background removal settings?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will revert all background removal settings to their default values.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        setSensitivityLevel(50);
                        setDetailLevel(50);
                        setProcessMethod('brightness');
                      }}>
                        Reset
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CollapsibleContent>
            </Collapsible>
          )}
          
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
          {backgroundRemovalModel === 'browser' && !advancedSettingsOpen && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800">
                <strong>Browser Processing:</strong> This option processes images entirely within your browser - no API key required. 
                Click "Show Settings" above to fine-tune the background removal.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundRemovalSection;
