
'use client';

import * as React from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, Save, Info, TestTube2 } from 'lucide-react'; // Import icons

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert components
import { useToast } from '@/hooks/use-toast';

// --- WebDAV Client Logic (Placeholder) ---
// In a real app, you would import a WebDAV client library (e.g., webdav)
// and implement these functions properly.

// Basic structure for WebDAV client options
interface WebDAVClientOptions {
  url: string;
  username?: string;
  password?: string;
}

// Placeholder function to simulate connecting and testing WebDAV credentials
async function testWebdavConnection(options: WebDAVClientOptions): Promise<boolean> {
    console.log("Simulating WebDAV connection test for:", options.url);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic URL validation (very simple)
    if (!options.url || !options.url.startsWith('http')) {
        console.error("Invalid WebDAV URL provided.");
        return false;
    }

    // Simulate success/failure based on simple criteria (e.g., presence of username/password)
    // In a real app, this would involve making an actual request (e.g., PROPFIND)
    const success = !!options.username && !!options.password; // Example: require auth for success
    if (success) {
        console.log("WebDAV connection test successful (simulated).");
    } else {
        console.warn("WebDAV connection test failed (simulated).");
    }
    return success;
}

// Placeholder function to simulate saving data
async function saveToWebdav(options: WebDAVClientOptions, data: any): Promise<void> {
    console.log("Simulating save to WebDAV:", options.url);
    console.log("Data:", JSON.stringify(data, null, 2));
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Save to WebDAV complete (simulated).");
    // In a real app, this would use putFileContents or similar
}

// Placeholder function to simulate loading data
async function loadFromWebdav(options: WebDAVClientOptions): Promise<any> {
    console.log("Simulating load from WebDAV:", options.url);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockData = [ /* ... mock event data ... */ ]; // Simulate loaded data
    console.log("Load from WebDAV complete (simulated).");
    return mockData;
}
// --- End WebDAV Client Logic ---


// Schema for WebDAV settings form
const webdavSettingsSchema = z.object({
  webdavUrl: z.string().url({ message: "请输入有效的 WebDAV URL。" }),
  webdavUsername: z.string().optional(),
  webdavPassword: z.string().optional(),
});

type WebdavSettingsFormValues = z.infer<typeof webdavSettingsSchema>;

interface WebdavSettingsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // Add props for saving/loading if needed, e.g.:
  // onSave: (settings: WebdavSettingsFormValues) => void;
  // initialSettings?: WebdavSettingsFormValues;
}

export function WebdavSettings({ isOpen, onOpenChange }: WebdavSettingsProps) {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [testResult, setTestResult] = React.useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const form = useForm<WebdavSettingsFormValues>({
    resolver: zodResolver(webdavSettingsSchema),
    // Load initial values from local storage or props
    defaultValues: {
      webdavUrl: typeof window !== 'undefined' ? localStorage.getItem('webdavUrl') || '' : '',
      webdavUsername: typeof window !== 'undefined' ? localStorage.getItem('webdavUsername') || '' : '',
      webdavPassword: typeof window !== 'undefined' ? localStorage.getItem('webdavPassword') || '' : '',
    },
  });

   // Reset test result when form values change
   React.useEffect(() => {
    setTestResult(null);
    setErrorMessage(null);
   }, [form.watch('webdavUrl'), form.watch('webdavUsername'), form.watch('webdavPassword')]);


  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setErrorMessage(null);
    const values = form.getValues();

    try {
        const success = await testWebdavConnection({
            url: values.webdavUrl,
            username: values.webdavUsername,
            password: values.webdavPassword,
        });

        if (success) {
            setTestResult('success');
            toast({
                title: "连接成功",
                description: "WebDAV 服务器连接测试成功！",
            });
        } else {
            setTestResult('error');
            setErrorMessage("无法连接到 WebDAV 服务器。请检查 URL 和凭据。");
            toast({
                title: "连接失败",
                description: "无法连接到 WebDAV 服务器。请检查 URL 和凭据。",
                variant: "destructive",
            });
        }
    } catch (error) {
        console.error("WebDAV connection test error:", error);
        setTestResult('error');
        setErrorMessage("测试连接时发生错误。");
        toast({
            title: "测试出错",
            description: "测试连接时发生意外错误。",
            variant: "destructive",
        });
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (values: WebdavSettingsFormValues) => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      // Save settings to local storage (or other persistent storage)
      localStorage.setItem('webdavUrl', values.webdavUrl);
      localStorage.setItem('webdavUsername', values.webdavUsername || '');
      localStorage.setItem('webdavPassword', values.webdavPassword || '');

      // Optionally, trigger a data sync here
      // await syncData();

      toast({
        title: "设置已保存",
        description: "WebDAV 同步设置已成功保存。",
      });
      onOpenChange(false); // Close dialog on successful save
    } catch (error) {
      console.error("Error saving WebDAV settings:", error);
      setErrorMessage("保存设置时出错。");
      toast({
        title: "保存失败",
        description: "保存 WebDAV 设置时出错。",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>WebDAV 同步设置</DialogTitle>
          <DialogDescription>
            配置您的 WebDAV 服务器以同步时间轴数据。数据将存储在指定路径下的 `timeline-data.json` 文件中。
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {testResult === 'success' && (
          <Alert variant="info" className="mt-4">
             <Info className="h-4 w-4" />
            <AlertTitle>连接成功</AlertTitle>
            <AlertDescription>WebDAV 服务器连接测试成功！</AlertDescription>
          </Alert>
        )}


        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="webdavUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WebDAV URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-webdav-server.com/path" {...field} />
                  </FormControl>
                  <FormDescription>
                    您的 WebDAV 服务器的完整 URL。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="webdavUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名 (可选)</FormLabel>
                  <FormControl>
                    <Input placeholder="WebDAV 用户名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="webdavPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码 (可选)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="WebDAV 密码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 pt-4 sm:justify-between">
               <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || !form.formState.isValid || !form.getValues('webdavUrl')}
              >
                {isTesting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <TestTube2 className="mr-2 h-4 w-4" />
                )}
                测试连接
              </Button>
               <div className="flex gap-2">
                 <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    取消
                 </Button>
                <Button type="submit" disabled={isSaving || !form.formState.isValid}>
                    {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Save className="mr-2 h-4 w-4" />
                    )}
                    保存设置
                </Button>
               </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
