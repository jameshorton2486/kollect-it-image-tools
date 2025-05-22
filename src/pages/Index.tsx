
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Features from '@/components/Features';
import ImageDropzone from '@/components/ImageDropzone';
import ImageProcessor from '@/components/ImageProcessor';
import { Button } from '@/components/ui/button';
import { BarChart3, HelpCircle, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Steps, Step } from '@/components/ui/steps';

const Index = () => {
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [showProcessor, setShowProcessor] = useState(false);

  const handleImageUpload = (files: File[]) => {
    setUploadedImages(files);
    setShowProcessor(true);
  };

  const handleReset = () => {
    setUploadedImages([]);
    setShowProcessor(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 container py-8">
        <section className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <div className="text-left">
              <h1 className="text-4xl font-bold mb-4">Kollect-It Image Optimizer</h1>
              <p className="text-xl text-gray-600 max-w-3xl">
                Optimize, resize, and compress your images for better performance on your WordPress site.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Link to="/analytics">
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart3 size={16} />
                  Analytics
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={() => window.open('https://docs.kollect-it.com/image-processor', '_blank')}
              >
                <HelpCircle size={16} />
                Help
              </Button>
            </div>
          </div>
          
          {!showProcessor ? (
            <Card className="max-w-4xl mx-auto shadow-sm border-brand-blue/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Get Started</CardTitle>
                <CardDescription className="text-center text-base">
                  Upload your images to begin optimizing them for WordPress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <Steps className="max-w-2xl mx-auto">
                    <Step title="Upload Images" description="Select or drag & drop your images" />
                    <Step title="Choose WordPress Type" description="Select the intended use for your images" />
                    <Step title="Process" description="Optimize with WordPress-specific settings" />
                    <Step title="Download" description="Save your WordPress-ready images" />
                  </Steps>
                </div>
                
                <div className="max-w-3xl mx-auto">
                  <ImageDropzone onImageUpload={handleImageUpload} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <ImageProcessor images={uploadedImages} onReset={handleReset} />
          )}
        </section>
        
        <Features />
        
        <section className="py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Optimize Your WordPress Images Today</h2>
            <p className="text-lg text-gray-600 mb-8">
              Perfect for Kollect-It.com and other WordPress sites. Reduce load times, improve SEO, and enhance user experience with optimized images.
            </p>
            
            {!showProcessor && (
              <div className="bg-brand-light p-6 rounded-lg border border-brand-blue">
                <div className="flex items-center justify-center mb-4">
                  <ListChecks className="mr-2 h-5 w-5 text-brand-blue" />
                  <h3 className="text-xl font-semibold">WordPress Image Specifications Included</h3>
                </div>
                <p className="text-left mb-4">
                  Our tool includes pre-configured WordPress image specifications for:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left mb-4">
                  <div className="flex items-center"><span className="w-1 h-1 rounded-full bg-brand-blue mr-2"></span> Logos</div>
                  <div className="flex items-center"><span className="w-1 h-1 rounded-full bg-brand-blue mr-2"></span> Favicons</div>
                  <div className="flex items-center"><span className="w-1 h-1 rounded-full bg-brand-blue mr-2"></span> Product Images</div>
                  <div className="flex items-center"><span className="w-1 h-1 rounded-full bg-brand-blue mr-2"></span> Hero Banners</div>
                  <div className="flex items-center"><span className="w-1 h-1 rounded-full bg-brand-blue mr-2"></span> Blog Featured Images</div>
                  <div className="flex items-center"><span className="w-1 h-1 rounded-full bg-brand-blue mr-2"></span> Background Images</div>
                  <div className="flex items-center"><span className="w-1 h-1 rounded-full bg-brand-blue mr-2"></span> Icons & UI Graphics</div>
                  <div className="flex items-center"><span className="w-1 h-1 rounded-full bg-brand-blue mr-2"></span> Gallery Images</div>
                  <div className="flex items-center"><span className="w-1 h-1 rounded-full bg-brand-blue mr-2"></span> Social Sharing Images</div>
                </div>
                <Button className="mt-2" onClick={() => document.querySelector('.drop-area')?.scrollIntoView({ behavior: 'smooth' })}>
                  Start Optimizing
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
