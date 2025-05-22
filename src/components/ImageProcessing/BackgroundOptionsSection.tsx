
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Layers, Image, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface BackgroundOptionsSectionProps {
  backgroundType: string;
  backgroundColor: string;
  backgroundOpacity: number;
  onBackgroundTypeChange: (type: string) => void;
  onBackgroundColorChange: (color: string) => void;
  onBackgroundOpacityChange: (opacity: number) => void;
  backgroundImage?: File | null;
  onBackgroundImageChange?: (image: File | null) => void;
}

const BackgroundOptionsSection: React.FC<BackgroundOptionsSectionProps> = ({
  backgroundType,
  backgroundColor,
  backgroundOpacity,
  onBackgroundTypeChange,
  onBackgroundColorChange,
  onBackgroundOpacityChange,
  backgroundImage,
  onBackgroundImageChange
}) => {
  // Common background colors for product photography
  const presetColors = [
    { name: "White", value: "#FFFFFF" },
    { name: "Light Gray", value: "#F5F5F5" },
    { name: "Transparent", value: "transparent" },
    { name: "Light Blue", value: "#E3F2FD" },
    { name: "Light Cream", value: "#FFF8E1" }
  ];

  // E-commerce specific background presets
  const ecommercePresets = [
    { name: "Amazon White", value: "#FFFFFF" },
    { name: "Etsy Beige", value: "#F9F6F1" },
    { name: "eBay Gray", value: "#F8F8F8" },
    { name: "Shopify Blue", value: "#F4F9FF" },
    { name: "Instagram Gradient", value: "linear-gradient(45deg, #FFDC80, #FCAF45, #F77737)" }
  ];
  
  // Handle file input for background image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onBackgroundImageChange) {
      onBackgroundImageChange(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4 border rounded-md p-4 bg-white/50">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4" />
        <h3 className="text-sm font-medium">Background Options</h3>
      </div>

      <Tabs defaultValue={backgroundType} onValueChange={onBackgroundTypeChange}>
        <TabsList className="grid grid-cols-4 mb-2">
          <TabsTrigger value="none">None</TabsTrigger>
          <TabsTrigger value="solid">Solid Color</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        
        <TabsContent value="none" className="text-xs text-muted-foreground">
          Keep transparent background for maximum flexibility
        </TabsContent>
        
        <TabsContent value="solid" className="space-y-3">
          <div className="space-y-3">
            <Label className="text-xs">Choose a preset</Label>
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
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs">E-commerce Platforms</Label>
            <div className="grid grid-cols-2 gap-2">
              {ecommercePresets.map((preset) => (
                <Button 
                  key={preset.name}
                  variant="outline" 
                  size="sm"
                  className="justify-start text-xs h-8"
                  onClick={() => onBackgroundColorChange(preset.value)}
                >
                  <span 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ background: preset.value }}
                  />
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
          
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
        
        <TabsContent value="image" className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Upload Background Image</Label>
            <div className="grid gap-2">
              <div className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md border-gray-300 px-6 py-4">
                <label className="flex flex-col items-center cursor-pointer">
                  {backgroundImage ? (
                    <div className="flex items-center">
                      <Image className="h-4 w-4 mr-2" />
                      <span className="text-xs">{backgroundImage.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-6 w-6 text-gray-400" />
                      <span className="mt-1 text-xs text-gray-500">Choose a background image</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {backgroundImage && onBackgroundImageChange && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onBackgroundImageChange(null)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
          
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
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-8 h-8 p-0" 
                  style={{ backgroundColor: backgroundColor }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <div className="grid gap-2">
                    <div className="grid grid-cols-5 gap-1">
                      {['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', '#FB5607', 
                        '#8338EC', '#3A86FF', '#F72585', '#4CC9F0', '#4361EE',
                        '#B5179E', '#480CA8', '#560BAD', '#F15BB5', '#7209B7'].map(color => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded-md border"
                          style={{ backgroundColor: color }}
                          onClick={() => onBackgroundColorChange(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
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
                </div>
              </PopoverContent>
            </Popover>
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
