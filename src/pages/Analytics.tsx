
import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowLeft, RefreshCw, DownloadCloud, HelpCircle, TrendingUp, FileImage, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatBytes } from '@/utils/imageUtils';
import { clearAnalyticsData, getAnalyticsData, getUsageStats } from '@/utils/analytics';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Legend, 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  XAxis, 
  YAxis 
} from 'recharts';
import { toast } from 'sonner';
import OptimizationRecommendations from '@/components/Analytics/OptimizationRecommendations';
import ProcessingMetricsCard from '@/components/Analytics/ProcessingMetricsCard';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(getAnalyticsData());
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Refresh data
  const refresh = () => {
    setAnalyticsData(getAnalyticsData());
    setRefreshKey(prev => prev + 1);
    toast.success("Analytics data refreshed");
  };
  
  // Clear data
  const clearData = () => {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      clearAnalyticsData();
      setAnalyticsData(getAnalyticsData());
      setRefreshKey(prev => prev + 1);
      toast.success("Analytics data cleared");
    }
  };
  
  // Download analytics data as JSON
  const downloadData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'kollect-it-analytics-data.json';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Analytics data downloaded");
  };
  
  // Memoize derived data to avoid recalculations on every render
  const stats = useMemo(() => getUsageStats(), [analyticsData, refreshKey]);
  
  // Format chart data
  const chartData = useMemo(() => {
    // Format data for the monthly trends chart
    const monthlyTrends = Object.entries(analyticsData.monthlyTrends || {}).map(([month, data]) => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      return {
        name: `${monthName} ${year}`,
        count: data.count,
        sizeSaved: Math.round(data.sizeSaved / (1024 * 1024)), // Convert to MB
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    
    // Format data for the format usage pie chart
    const formatUsage = Object.entries(analyticsData.formatUsage || {}).map(([format, count]) => ({
      name: format.toUpperCase(),
      value: count,
      color: format === 'webp' ? '#27ae60' : 
             format === 'jpeg' ? '#FF9966' :
             format === 'avif' ? '#f1c40f' : 
             format === 'png' ? '#3498db' : '#6B7280'
    }));
    
    // Generate compression rate distribution data
    const compressionRates = [
      { range: '0-20%', count: 0, color: '#EF4444' },
      { range: '20-40%', count: 0, color: '#F59E0B' },
      { range: '40-60%', count: 0, color: '#10B981' },
      { range: '60-80%', count: 0, color: '#3B82F6' },
      { range: '80-100%', count: 0, color: '#8B5CF6' }
    ];
    
    // Count images in each compression rate range
    analyticsData.events.forEach(event => {
      const rate = event.compressionRate * 100;
      if (rate < 20) compressionRates[0].count++;
      else if (rate < 40) compressionRates[1].count++;
      else if (rate < 60) compressionRates[2].count++;
      else if (rate < 80) compressionRates[3].count++;
      else compressionRates[4].count++;
    });
    
    // Generate processing time data
    const processingTimes = analyticsData.events.map((event, index) => ({
      id: index,
      date: new Date(event.timestamp).toLocaleDateString(),
      time: event.processingTime / 1000, // Convert to seconds
      imageCount: event.imageCount
    }));
    
    return {
      monthlyTrends,
      formatUsage,
      compressionRates,
      processingTimes
    };
  }, [analyticsData, refreshKey]);
  
  // Calculate total images processed
  const totalImagesProcessed = analyticsData.totalProcessed || 0;
  
  // Check if we have data to display
  const hasData = totalImagesProcessed > 0;

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="inline-flex items-center mb-2 text-sage-gray hover:text-kollect-blue transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Image Optimizer
              </Link>
              <h1 className="text-3xl font-bold text-charcoal">Analytics Dashboard</h1>
              <p className="text-sage-gray mt-1">Track image optimization performance and usage statistics</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={refresh} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
              
              <Button variant="outline" onClick={downloadData} className="flex items-center gap-2">
                <DownloadCloud className="h-4 w-4" />
                Export Data
              </Button>
              
              <Button variant="outline" onClick={clearData} className="text-error-burgundy border-error-burgundy hover:bg-error-burgundy/10 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Clear Data
              </Button>
            </div>
          </div>
        </div>
        
        {!hasData ? (
          // No data view
          <div className="mt-12 text-center">
            <div className="mb-6 mx-auto w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-sage-gray" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Analytics Data Yet</h2>
            <p className="text-sage-gray mb-6 max-w-md mx-auto">
              Start optimizing images to see analytics data. Compression statistics will appear here once you process some images.
            </p>
            <Link to="/">
              <Button>Get Started</Button>
            </Link>
          </div>
        ) : (
          // Dashboard content
          <div className="space-y-6">
            {/* Summary Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {/* Total Images Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-sage-gray">Total Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold text-kollect-blue">
                      {totalImagesProcessed.toLocaleString()}
                    </div>
                    <div className="text-sm text-sage-gray mb-1">images</div>
                  </div>
                  <p className="text-xs text-sage-gray mt-1">
                    Processed in {Object.keys(analyticsData.events).length} sessions
                  </p>
                </CardContent>
              </Card>
              
              {/* Space Saved Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-sage-gray">Total Space Saved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold text-success-green">
                      {formatBytes(analyticsData.totalSizeSaved || 0)}
                    </div>
                    <div className="text-sm text-sage-gray mb-1">saved</div>
                  </div>
                  <p className="text-xs text-sage-gray mt-1">
                    Average {Math.round((analyticsData.averageCompressionRate || 0) * 100)}% reduction per image
                  </p>
                </CardContent>
              </Card>
              
              {/* Format Usage Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-sage-gray">Top Format</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.formatUsage.length > 0 ? (
                    <>
                      <div className="flex items-end gap-2">
                        <div className="text-3xl font-bold text-antique-gold">
                          {chartData.formatUsage.sort((a, b) => b.value - a.value)[0].name}
                        </div>
                      </div>
                      <p className="text-xs text-sage-gray mt-1">
                        Used for {chartData.formatUsage.sort((a, b) => b.value - a.value)[0].value} image(s)
                      </p>
                    </>
                  ) : (
                    <p className="text-sage-gray">No format data available</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Compression Rate Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-sage-gray">Avg. Compression Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold text-kollect-blue">
                      {Math.round((analyticsData.averageCompressionRate || 0) * 100)}%
                    </div>
                  </div>
                  <p className="text-xs text-sage-gray mt-1">
                    {analyticsData.averageCompressionRate > 0.7 ? 'Excellent' : 
                     analyticsData.averageCompressionRate > 0.5 ? 'Good' : 
                     analyticsData.averageCompressionRate > 0.3 ? 'Average' : 'Low'} compression efficiency
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends Chart */}
              <Card className="shadow-sm col-span-full">
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Trends</CardTitle>
                  <CardDescription>
                    Images processed and space saved over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {chartData.monthlyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData.monthlyTrends}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="count"
                          name="Images Processed"
                          stroke="#4F46E5"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="sizeSaved"
                          name="Space Saved (MB)"
                          stroke="#10B981"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Gauge className="h-10 w-10 text-sage-gray mx-auto mb-2" />
                        <p>Not enough data to show trends yet</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Format Usage Pie Chart */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Format Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of output formats used
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {chartData.formatUsage.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.formatUsage}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {chartData.formatUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value, name) => [`${value} images`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileImage className="h-10 w-10 text-sage-gray mx-auto mb-2" />
                        <p>No format data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Compression Ratio Chart */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Compression Efficiency</CardTitle>
                  <CardDescription>
                    Distribution of compression ratios
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {chartData.compressionRates.some(item => item.count > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.compressionRates}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip formatter={(value) => [`${value} image(s)`, 'Count']} />
                        <Legend />
                        <Bar dataKey="count" name="Images" fill="#4F46E5">
                          {chartData.compressionRates.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <TrendingUp className="h-10 w-10 text-sage-gray mx-auto mb-2" />
                        <p>No compression data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Advanced Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Processing Metrics */}
              <ProcessingMetricsCard analyticsData={analyticsData} />
              
              {/* Optimization Recommendations */}
              <OptimizationRecommendations analyticsData={analyticsData} />
            </div>
            
            {/* Popular Presets Section */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Most Used Presets</CardTitle>
                <CardDescription>
                  Popular WordPress image presets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(analyticsData.mostUsedPresets || {}).length > 0 ? (
                  <div className="grid gap-2">
                    {Object.entries(analyticsData.mostUsedPresets || {})
                      .sort(([, countA], [, countB]) => Number(countB) - Number(countA))
                      .slice(0, 5)
                      .map(([preset, count]) => (
                        <div 
                          key={preset} 
                          className="flex items-center justify-between p-2 border border-border rounded-md"
                        >
                          <div className="font-medium">{preset}</div>
                          <div className="text-sage-gray">{count} images</div>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-sage-gray">No preset usage data available yet</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 border-t">
                <div className="flex items-center gap-2 text-xs text-sage-gray">
                  <HelpCircle className="h-3 w-3" />
                  <span>Presets are tracked when you apply a WordPress or custom preset to your images</span>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Analytics;
