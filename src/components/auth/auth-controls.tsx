
'use client';

import React, { useState } from 'react';
import { LogIn, LogOut, UserPlus, Loader2 } from 'lucide-react';
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
// Need Tooltip wrapper components if not already available globally
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


// Helper function to get Firebase error message
const getFirebaseErrorMessage = (error: AuthError): string => {
    switch (error.code) {
        case 'auth/invalid-email':
            return '无效的邮箱格式。';
        case 'auth/user-disabled':
            return '该用户已被禁用。';
        case 'auth/user-not-found':
            return '未找到该用户。';
        case 'auth/wrong-password':
            return '密码错误。';
        case 'auth/email-already-in-use':
            return '该邮箱已被注册。';
        case 'auth/weak-password':
            return '密码强度不足（至少需要6位字符）。';
        case 'auth/operation-not-allowed':
            return '邮箱/密码登录方式未启用。';
        case 'auth/invalid-credential':
             return '凭证无效或已过期，请重新登录。'; // Generic message for invalid credentials
        // Specific handling for API key issue
        case 'auth/api-key-not-valid':
        case 'auth/app-not-authorized': // Often related to API key/domain restrictions
             console.error("Firebase API Key Error:", error);
             return 'Firebase 配置无效或不完整。请检查 .env.local 文件中的 Firebase API 密钥和其他配置是否正确，并确保已重启开发服务器。';
        default:
            console.error('Unhandled Firebase Auth Error:', error); // Log unexpected errors
            return `登录/注册失败 (${error.code})。请稍后再试或检查您的凭据。`; // Fallback message
    }
};


export function AuthControls() {
    const { user, loading } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState<string | null>(null);
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
            setAuthError('密码至少需要6位字符。');
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
             setAuthError("退出登录失败。");
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
                            aria-label="退出登录"
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
                                    <LogIn className="h-4 w-4 mr-1" /> 登录
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>用户登录</DialogTitle>
                                    <DialogDescription>
                                        输入您的邮箱和密码进行登录。
                                    </DialogDescription>
                                </DialogHeader>
                                {authError && (
                                    <Alert variant="destructive">
                                        <AlertTitle>登录错误</AlertTitle>
                                        <AlertDescription>{authError}</AlertDescription>
                                    </Alert>
                                )}
                                <form onSubmit={handleLogin}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="login-email" className="text-right">
                                                邮箱
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
                                                密码
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
                                            <Button type="button" variant="outline" disabled={isAuthLoading}>取消</Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={isAuthLoading}>
                                            {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            登录
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Register Dialog */}
                        <Dialog open={isRegisterOpen} onOpenChange={handleOpenChange(setIsRegisterOpen)}>
                            <DialogTrigger asChild>
                                <Button variant="default" size="sm" className="h-8 px-2">
                                    <UserPlus className="h-4 w-4 mr-1" /> 注册
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>用户注册</DialogTitle>
                                    <DialogDescription>
                                        创建一个新账户。密码至少需要6位字符。
                                    </DialogDescription>
                                </DialogHeader>
                                {authError && (
                                    <Alert variant="destructive">
                                        <AlertTitle>注册错误</AlertTitle>
                                        <AlertDescription>{authError}</AlertDescription>
                                    </Alert>
                                )}
                                <form onSubmit={handleRegister}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="register-email" className="text-right">
                                                邮箱
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
                                                密码
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
                                            <Button type="button" variant="outline" disabled={isAuthLoading}>取消</Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={isAuthLoading}>
                                            {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            注册
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
