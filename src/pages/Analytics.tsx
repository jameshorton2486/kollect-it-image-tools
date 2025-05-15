
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getUsageStats, clearAnalyticsData } from '@/utils/analyticsUtils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  PieChart, 
  ChevronLeft, 
  RefreshCw, 
  Trash2, 
  Save, 
  Image, 
  Download,
  Clock
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';

const Analytics = () => {
  const [stats, setStats] = React.useState(getUsageStats());
  
  const formattedSize = React.useMemo(() => {
    if (stats.totalSavedBytes < 1024) {
      return `${stats.totalSavedBytes} bytes`;
    } else if (stats.totalSavedBytes < 1024 * 1024) {
      return `${(stats.totalSavedBytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(stats.totalSavedBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }, [stats.totalSavedBytes]);
  
  const refreshStats = React.useCallback(() => {
    setStats(getUsageStats());
    toast({
      title: "Statistics Refreshed",
      description: "Analytics data has been updated"
    });
  }, []);
  
  const handleClearAnalytics = React.useCallback(() => {
    if (window.confirm("Are you sure you want to clear all analytics data? This action cannot be undone.")) {
      clearAnalyticsData();
      setStats(getUsageStats());
      toast({
        title: "Analytics Cleared",
        description: "All analytics data has been reset"
      });
    }
  }, []);
  
  const handleExportData = React.useCallback(() => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `image-optimizer-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast({
        title: "Export Complete",
        description: "Analytics data has been exported as JSON"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export analytics data"
      });
    }
  }, [stats]);
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link to="/">
              <Button variant="outline" size="sm" className="mr-2">
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshStats}>
              <RefreshCw className="mr-1 h-4 w-4" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Save className="mr-1 h-4 w-4" /> Export
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearAnalytics}>
              <Trash2 className="mr-1 h-4 w-4" /> Clear Data
            </Button>
          </div>
        </div>
        
        {stats.totalImages === 0 ? (
          <div className="text-center py-12">
            <Image className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-semibold mb-2">No Analytics Data Yet</h2>
            <p className="text-gray-500 mb-6">
              Process some images to see usage statistics and analytics data.
            </p>
            <Link to="/">
              <Button>Process Images Now</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Images Processed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Image className="h-5 w-5 mr-2 text-blue-500" />
                    <span className="text-3xl font-bold">{stats.totalImages}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Downloads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Download className="h-5 w-5 mr-2 text-green-500" />
                    <span className="text-3xl font-bold">{stats.totalDownloads}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Storage Saved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Save className="h-5 w-5 mr-2 text-purple-500" />
                    <span className="text-3xl font-bold">{formattedSize}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Background Removals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-orange-500" />
                    <span className="text-3xl font-bold">{stats.backgroundRemovalCount}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Detailed stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compression Efficiency</CardTitle>
                  <CardDescription>Average file size reduction and processing metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Compression Ratio</span>
                      <span className="text-sm font-medium">
                        {(stats.averageCompressionRatio * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={stats.averageCompressionRatio * 100} />
                  </div>
                  
                  <div className="pt-2">
                    <div className="text-sm font-medium mb-1">Average Processing Time</div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      <span>
                        {stats.averageProcessingTime > 1000
                          ? `${(stats.averageProcessingTime / 1000).toFixed(2)} seconds`
                          : `${Math.round(stats.averageProcessingTime)} ms`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>Sessions and image processing activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Total Sessions</div>
                      <div className="text-2xl font-bold">{stats.totalSessionsCount}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Images per Session</div>
                      <div className="text-2xl font-bold">
                        {stats.totalSessionsCount > 0
                          ? (stats.totalImages / stats.totalSessionsCount).toFixed(1)
                          : "0"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className="text-sm font-medium text-gray-500 mb-1">Last Active</div>
                    <div className="text-base">
                      {stats.lastSessionDate
                        ? formatDistanceToNow(new Date(stats.lastSessionDate), { addSuffix: true })
                        : "Never"}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-gray-500">
                  {stats.lastSessionDate && (
                    <div>Last session: {format(new Date(stats.lastSessionDate), 'PPp')}</div>
                  )}
                </CardFooter>
              </Card>
            </div>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Analytics;
