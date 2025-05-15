
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features: React.FC = () => {
  const features = [
    {
      title: 'Image Compression',
      description: 'Reduce file sizes without sacrificing quality, using advanced compression algorithms.',
      icon: '📦'
    },
    {
      title: 'Image Resizing',
      description: 'Easily resize images to exact dimensions for your website or WordPress posts.',
      icon: '📏'
    },
    {
      title: 'Background Removal',
      description: 'Coming soon! Remove image backgrounds for clean, professional product photos.',
      icon: '✂️'
    },
    {
      title: 'Batch Processing',
      description: 'Save time by processing multiple images at once with consistent settings.',
      icon: '🔄'
    },
    {
      title: 'WordPress Compatible',
      description: 'Optimized for WordPress sites, helping improve load times and SEO rankings.',
      icon: '🌐'
    },
    {
      title: 'No Account Required',
      description: 'No sign-up needed. Just drop your images and start optimizing immediately.',
      icon: '🚀'
    }
  ];

  return (
    <section id="features" className="py-12 bg-gray-50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Image Optimization Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            All the tools you need to optimize images for your Kollect-It WordPress website in one place.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="text-3xl mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
