
'use client';

import React, { useState } from 'react';
import { LogIn, LogOut, UserPlus, Loader2, AlertCircle } from 'lucide-react'; // Import AlertCircle
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


// Helper function to get Firebase error message and specific advice
const getFirebaseErrorMessage = (error: AuthError): { title: string; message: string; isConfigError?: boolean } => {
    let title = '认证错误'; // Default title in Chinese: "Authentication Error"
    let message = `登录/注册失败 (${error.code})。请稍后再试或检查您的凭据。`; // Default message
    let isConfigError = false;

    switch (error.code) {
        case 'auth/invalid-email':
            message = '无效的邮箱格式。'; // "Invalid email format."
            break;
        case 'auth/user-disabled':
            message = '该用户已被禁用。'; // "This user has been disabled."
            break;
        case 'auth/user-not-found':
            title = '登录错误'; // "Login Error"
            message = '未找到该用户。'; // "User not found."
            break;
        case 'auth/wrong-password':
             title = '登录错误'; // "Login Error"
            message = '密码错误。'; // "Incorrect password."
            break;
        case 'auth/email-already-in-use':
             title = '注册错误'; // "Registration Error"
            message = '该邮箱已被注册。'; // "This email is already registered."
            break;
        case 'auth/weak-password':
             title = '注册错误'; // "Registration Error"
            message = '密码强度不足（至少需要6位字符）。'; // "Password is too weak (at least 6 characters required)."
            break;
        case 'auth/operation-not-allowed':
            message = '邮箱/密码登录方式未启用。'; // "Email/password sign-in method is not enabled."
            break;
        case 'auth/invalid-credential':
             title = '登录错误'; // "Login Error"
             message = '凭证无效或已过期，请重新登录。'; // "Invalid credential or expired, please log in again."
             break;
        // Specific handling for API key/config issues
        case 'auth/api-key-not-valid':
        case 'auth/app-not-authorized': // Often related to API key/domain restrictions
             console.error("Firebase API Key/Configuration Error:", error);
             title = 'Firebase 配置错误'; // "Firebase Configuration Error"
             message = 'Firebase 配置无效或不完整。请执行以下步骤：\n1. 检查项目根目录下的 `.env.local` 文件。\n2. 确保包含正确的 Firebase 配置 (NEXT_PUBLIC_FIREBASE_API_KEY 等)。\n3. **修改 `.env.local` 文件后，必须重启开发服务器 (例如，停止并重新运行 `npm run dev`)。**'; // More detailed instructions
             isConfigError = true;
             break;
        default:
            console.error('Unhandled Firebase Auth Error:', error); // Log unexpected errors
            // Keep the generic message but provide the code
            message = `发生未知认证错误 (${error.code})。请稍后再试。`; // "An unknown authentication error occurred..."
    }
    return { title, message, isConfigError };
};


export function AuthControls() {
    const { user, loading } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState<{ title: string; message: string; isConfigError?: boolean } | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        setIsAuthLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setIsLoginOpen(false); // Close dialog on success
            resetForm();
        } catch (error) {
            setAuthError(getFirebaseErrorMessage(error as AuthError));
        } finally {
            setIsAuthLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError(null);
        setIsAuthLoading(true);
        if (password.length < 6) {
            setAuthError({ title: '注册错误', message: '密码至少需要6位字符。' }); // "Password must be at least 6 characters."
            setIsAuthLoading(false);
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setIsRegisterOpen(false); // Close dialog on success
            resetForm();
        } catch (error) {
            setAuthError(getFirebaseErrorMessage(error as AuthError));
        } finally {
            setIsAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        setIsAuthLoading(true); // Indicate loading state
        setAuthError(null);
        try {
            await signOut(auth);
        } catch (error) {
             console.error("Logout Error:", error);
             setAuthError({ title: '退出登录错误', message: '退出登录失败。' }); // "Logout failed."
        } finally {
             setIsAuthLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setAuthError(null);
        setIsAuthLoading(false);
    };

    const handleOpenChange = (setter: React.Dispatch<React.SetStateAction<boolean>>) => (open: boolean) => {
        setter(open);
        if (!open) {
            resetForm(); // Reset form when dialog closes
        }
    };


    if (loading) {
        return <Button variant="ghost" size="icon" className="h-8 w-8" disabled><Loader2 className="h-4 w-4 animate-spin" /></Button>;
    }

    // Function to render the error alert
    const renderErrorAlert = () => {
        if (!authError) return null;
        return (
             <Alert variant="destructive">
                {authError.isConfigError && <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{authError.title}</AlertTitle>
                {/* Use whitespace-pre-line to respect newlines in the config error message */}
                <AlertDescription className={authError.isConfigError ? "whitespace-pre-line" : ""}>
                    {authError.message}
                </AlertDescription>
            </Alert>
        );
    };


    return (
        <TooltipProvider>
            <div className="flex items-center gap-2">
                {user ? (
                    <>
                        <span className="text-sm text-muted-foreground hidden sm:inline">欢迎, {user.email}</span>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleLogout}
                            disabled={isAuthLoading}
                            aria-label="退出登录" // "Log out"
                            >
                            {isAuthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><p>退出登录</p></TooltipContent>
                        </Tooltip>
                    </>
                ) : (
                    <>
                        {/* Login Dialog */}
                        <Dialog open={isLoginOpen} onOpenChange={handleOpenChange(setIsLoginOpen)}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2">
                                    <LogIn className="h-4 w-4 mr-1" /> 登录 {/* Login */}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>用户登录</DialogTitle> {/* User Login */}
                                    <DialogDescription>
                                        输入您的邮箱和密码进行登录。 {/* Enter your email and password to log in. */}
                                    </DialogDescription>
                                </DialogHeader>
                                {renderErrorAlert()} {/* Render error alert */}
                                <form onSubmit={handleLogin}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="login-email" className="text-right">
                                                邮箱 {/* Email */}
                                            </Label>
                                            <Input
                                                id="login-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="col-span-3"
                                                required
                                                disabled={isAuthLoading}
                                                autoComplete="email"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="login-password" className="text-right">
                                                密码 {/* Password */}
                                            </Label>
                                            <Input
                                                id="login-password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="col-span-3"
                                                required
                                                disabled={isAuthLoading}
                                                autoComplete="current-password"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline" disabled={isAuthLoading}>取消</Button> {/* Cancel */}
                                        </DialogClose>
                                        <Button type="submit" disabled={isAuthLoading}>
                                            {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            登录 {/* Login */}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Register Dialog */}
                        <Dialog open={isRegisterOpen} onOpenChange={handleOpenChange(setIsRegisterOpen)}>
                            <DialogTrigger asChild>
                                <Button variant="default" size="sm" className="h-8 px-2">
                                    <UserPlus className="h-4 w-4 mr-1" /> 注册 {/* Register */}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>用户注册</DialogTitle> {/* User Registration */}
                                    <DialogDescription>
                                        创建一个新账户。密码至少需要6位字符。 {/* Create a new account. Password requires at least 6 characters. */}
                                    </DialogDescription>
                                </DialogHeader>
                                {renderErrorAlert()} {/* Render error alert */}
                                <form onSubmit={handleRegister}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="register-email" className="text-right">
                                                邮箱 {/* Email */}
                                            </Label>
                                            <Input
                                                id="register-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="col-span-3"
                                                required
                                                disabled={isAuthLoading}
                                                autoComplete="email"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="register-password" className="text-right">
                                                密码 {/* Password */}
                                            </Label>
                                            <Input
                                                id="register-password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="col-span-3"
                                                required
                                                minLength={6}
                                                disabled={isAuthLoading}
                                                autoComplete="new-password"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline" disabled={isAuthLoading}>取消</Button> {/* Cancel */}
                                        </DialogClose>
                                        <Button type="submit" disabled={isAuthLoading}>
                                            {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            注册 {/* Register */}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </div>
        </TooltipProvider>
    );
}

