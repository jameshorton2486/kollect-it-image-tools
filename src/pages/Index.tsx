
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Features from '@/components/Features';
import ImageDropzone from '@/components/ImageDropzone';
import ImageProcessor from '@/components/ImageProcessor';

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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Kollect-It Image Optimizer</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Optimize, resize, and compress your images for better performance on your WordPress site.
            </p>
          </div>
          
          {!showProcessor ? (
            <div className="max-w-3xl mx-auto">
              <ImageDropzone onImageUpload={handleImageUpload} />
            </div>
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
                <h3 className="text-xl font-semibold mb-2">Getting Started is Easy</h3>
                <ol className="text-left list-decimal list-inside space-y-2 mb-4">
                  <li>Drag and drop your images into the upload area</li>
                  <li>Adjust compression and resize settings</li>
                  <li>Process your images individually or in batch</li>
                  <li>Download your optimized images</li>
                  <li>Upload to your WordPress site</li>
                </ol>
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
