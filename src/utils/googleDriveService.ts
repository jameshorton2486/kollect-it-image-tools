
interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  redirectUri: string;
}

interface GoogleDriveUploadResult {
  success: boolean;
  fileId?: string;
  webViewLink?: string;
  error?: string;
}

export class GoogleDriveService {
  private config: GoogleDriveConfig | null = null;
  private accessToken: string | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    const savedConfig = localStorage.getItem('google_drive_config');
    if (savedConfig) {
      try {
        this.config = JSON.parse(savedConfig);
      } catch (error) {
        console.error('Failed to parse Google Drive config:', error);
      }
    }
  }

  public saveConfig(config: GoogleDriveConfig): void {
    this.config = config;
    localStorage.setItem('google_drive_config', JSON.stringify(config));
  }

  public isConfigured(): boolean {
    return !!(this.config?.clientId && this.config?.clientSecret && this.config?.refreshToken);
  }

  public getConfig(): GoogleDriveConfig | null {
    return this.config;
  }

  private async getAccessToken(): Promise<string> {
    if (!this.config) {
      throw new Error('Google Drive not configured');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      return data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  public async createFolder(name: string, parentId?: string): Promise<string> {
    const accessToken = await this.getAccessToken();
    
    const metadata = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    };

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error('Failed to create folder');
    }

    const result = await response.json();
    return result.id;
  }

  public async uploadFile(
    file: File,
    fileName: string,
    folderId?: string
  ): Promise<GoogleDriveUploadResult> {
    try {
      const accessToken = await this.getAccessToken();

      const metadata = {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        fileId: result.id,
        webViewLink: result.webViewLink,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public async findFolderByName(name: string, parentId?: string): Promise<string | null> {
    try {
      const accessToken = await this.getAccessToken();
      
      let query = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`;
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search for folder');
      }

      const result = await response.json();
      return result.files.length > 0 ? result.files[0].id : null;
    } catch (error) {
      console.error('Error finding folder:', error);
      return null;
    }
  }

  public async ensureFolderStructure(): Promise<{
    baseFolderId: string;
    rawUploadsFolderId: string;
    processedImagesFolderId: string;
    htmlSnippetsFolderId: string;
  }> {
    // Create base folder
    let baseFolderId = await this.findFolderByName('Kollect-It Media');
    if (!baseFolderId) {
      baseFolderId = await this.createFolder('Kollect-It Media');
    }

    // Create subfolders
    let rawUploadsFolderId = await this.findFolderByName('Raw Uploads', baseFolderId);
    if (!rawUploadsFolderId) {
      rawUploadsFolderId = await this.createFolder('Raw Uploads', baseFolderId);
    }

    let processedImagesFolderId = await this.findFolderByName('Processed Images', baseFolderId);
    if (!processedImagesFolderId) {
      processedImagesFolderId = await this.createFolder('Processed Images', baseFolderId);
    }

    let htmlSnippetsFolderId = await this.findFolderByName('HTML Snippets', baseFolderId);
    if (!htmlSnippetsFolderId) {
      htmlSnippetsFolderId = await this.createFolder('HTML Snippets', baseFolderId);
    }

    return {
      baseFolderId,
      rawUploadsFolderId,
      processedImagesFolderId,
      htmlSnippetsFolderId,
    };
  }
}

export const googleDriveService = new GoogleDriveService();
