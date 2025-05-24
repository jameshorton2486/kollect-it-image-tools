
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, CheckCircle, AlertCircle, ExternalLink, Folder } from 'lucide-react';
import { googleDriveService } from '@/utils/googleDriveService';
import { toast } from 'sonner';

const GoogleDriveConfig: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isCreatingFolders, setIsCreatingFolders] = useState(false);
  
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    refreshToken: '',
    redirectUri: 'http://localhost:3000',
  });

  useEffect(() => {
    const savedConfig = googleDriveService.getConfig();
    if (savedConfig) {
      setConfig(savedConfig);
      setIsConfigured(googleDriveService.isConfigured());
    }
  }, []);

  const handleSaveConfig = () => {
    try {
      googleDriveService.saveConfig(config);
      setIsConfigured(googleDriveService.isConfigured());
      toast.success('Google Drive configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    }
  };

  const handleCreateFolderStructure = async () => {
    if (!isConfigured) {
      toast.error('Please configure Google Drive first');
      return;
    }

    setIsCreatingFolders(true);
    try {
      await googleDriveService.ensureFolderStructure();
      toast.success('Folder structure created successfully in Google Drive');
    } catch (error) {
      toast.error('Failed to create folder structure');
      console.error('Folder creation error:', error);
    } finally {
      setIsCreatingFolders(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Google Drive Integration
          </div>
          <div className="flex items-center gap-2">
            {isConfigured ? (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="h-4 w-4" />
                Configured
              </div>
            ) : (
              <div className="flex items-center gap-1 text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Not Configured
              </div>
            )}
            <Switch
              checked={isExpanded}
              onCheckedChange={setIsExpanded}
            />
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              To set up Google Drive integration, you'll need to create a project in Google Cloud Console,
              enable the Drive API, and create OAuth 2.0 credentials.{' '}
              <Button variant="link" className="p-0 h-auto" asChild>
                <a 
                  href="https://console.cloud.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  Open Google Cloud Console
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                placeholder="Your Google OAuth Client ID"
                value={config.clientId}
                onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="Your Google OAuth Client Secret"
                value={config.clientSecret}
                onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirectUri">Redirect URI</Label>
              <Input
                id="redirectUri"
                placeholder="http://localhost:3000"
                value={config.redirectUri}
                onChange={(e) => setConfig({ ...config, redirectUri: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refreshToken">Refresh Token</Label>
              <Textarea
                id="refreshToken"
                placeholder="Your refresh token (generate using OAuth playground)"
                value={config.refreshToken}
                onChange={(e) => setConfig({ ...config, refreshToken: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleSaveConfig} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
            
            <Button 
              onClick={handleCreateFolderStructure}
              disabled={!isConfigured || isCreatingFolders}
              variant="outline"
              className="flex-1"
            >
              <Folder className="h-4 w-4 mr-2" />
              {isCreatingFolders ? 'Creating...' : 'Create Folder Structure'}
            </Button>
          </div>

          {isConfigured && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Google Drive is configured. Files will be uploaded to:
                <br />
                • Raw uploads: Google Drive/Kollect-It Media/Raw Uploads
                <br />
                • Processed images: Google Drive/Kollect-It Media/Processed Images
                <br />
                • HTML snippets: Google Drive/Kollect-It Media/HTML Snippets
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default GoogleDriveConfig;
