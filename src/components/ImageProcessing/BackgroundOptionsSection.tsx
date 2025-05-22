
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Layers } from "lucide-react";

interface BackgroundOptionsSectionProps {
  backgroundType: string;
  backgroundColor: string;
  backgroundOpacity: number;
  onBackgroundTypeChange: (type: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onBackgroundOpacityChange: (opacity: number) => void;
}

const BackgroundOptionsSection: React.FC<BackgroundOptionsSectionProps> = ({
  backgroundType,
  backgroundColor,
  backgroundOpacity,
  onBackgroundTypeChange,
  onBackgroundColorChange,
  onBackgroundOpacityChange
}) => {
  // Common background colors for product photography
  const presetColors = [
    { name: "White", value: "#FFFFFF" },
    { name: "Light Gray", value: "#F5F5F5" },
    { name: "Transparent", value: "transparent" },
    { name: "Light Blue", value: "#E3F2FD" },
    { name: "Light Cream", value: "#FFF8E1" }
  ];

  return (
    <div className="space-y-4 border rounded-md p-4 bg-white/50">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4" />
        <h3 className="text-sm font-medium">Background Options</h3>
      </div>

      <Tabs defaultValue={backgroundType} onValueChange={onBackgroundTypeChange}>
        <TabsList className="grid grid-cols-3 mb-2">
          <TabsTrigger value="none">None</TabsTrigger>
          <TabsTrigger value="solid">Solid Color</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        
        <TabsContent value="none" className="text-xs text-muted-foreground">
          Keep transparent background for maximum flexibility
        </TabsContent>
        
        <TabsContent value="solid" className="space-y-3">
          <RadioGroup 
            value={backgroundColor}
            onValueChange={onBackgroundColorChange}
            className="flex flex-wrap gap-2"
          >
            {presetColors.map((color) => (
              <div key={color.value} className="flex items-center space-x-1">
                <RadioGroupItem value={color.value} id={`color-${color.value}`} />
                <Label 
                  htmlFor={`color-${color.value}`}
                  className="flex items-center space-x-1"
                >
                  <span 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-xs">{color.name}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="space-y-2">
            <Label className="text-xs">Background Opacity</Label>
            <div className="flex space-x-2">
              <Slider
                value={[backgroundOpacity]}
                min={0}
                max={100}
                step={1}
                className="flex-1"
                onValueChange={(value) => onBackgroundOpacityChange(value[0])}
              />
              <span className="text-xs w-8 text-center">{backgroundOpacity}%</span>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-2">
          <div className="flex space-x-2 items-center">
            <Label className="text-xs whitespace-nowrap">Custom Color</Label>
            <Input 
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="w-12 h-8 p-1"
            />
            <Input 
              type="text"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="flex-1 h-8 text-xs"
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Background Opacity</Label>
            <div className="flex space-x-2">
              <Slider
                value={[backgroundOpacity]}
                min={0}
                max={100}
                step={1}
                className="flex-1"
                onValueChange={(value) => onBackgroundOpacityChange(value[0])}
              />
              <span className="text-xs w-8 text-center">{backgroundOpacity}%</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BackgroundOptionsSection;
