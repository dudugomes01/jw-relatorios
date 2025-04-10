// import { useState, useEffect } from "react";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { insertUserSchema, InsertUser } from "@shared/schema";
// import { useAuth } from "@/hooks/use-auth";
// import { useLocation } from "wouter";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent } from "@/components/ui/card";
// import { Loader2 } from "lucide-react";
// import { toast } from "@/hooks/use-toast";

// const loginSchema = z.object({
//   identifier: z.string().min(1, "Usuário ou email é obrigatório"),
//   password: z.string().min(1, "Senha é obrigatória"),
//   rememberMe: z.boolean().optional(),
// });

// type LoginFormValues = z.infer<typeof loginSchema>;

// const registerSchema = insertUserSchema.extend({
//   passwordConfirmation: z.string().min(1, "Confirmação de senha é obrigatória"),
// }).refine((data) => data.password === data.passwordConfirmation, {
//   message: "As senhas não coincidem",
//   path: ["passwordConfirmation"],
// });

// type RegisterFormValues = z.infer<typeof registerSchema>;

// export default function AuthPage() {
//   const { user, loginMutation, registerMutation, isLoading } = useAuth();
//   const [activeTab, setActiveTab] = useState<string>("login");
//   const [, navigate] = useLocation();

//   useEffect(() => {
//     if (user) {
//       navigate("/");
//     }
//   }, [user, navigate]);

//   const loginForm = useForm<LoginFormValues>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       identifier: "",
//       password: "",
//       rememberMe: false,
//     },
//   });

//   const registerForm = useForm<RegisterFormValues>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       username: "",
//       email: "",
//       password: "",
//       passwordConfirmation: "",
//     },
//   });

//   const onLoginSubmit = (values: LoginFormValues) => {
//     console.log("Tentando fazer login com os valores:", values); // Log para depuração
  
//     loginMutation.mutate({
//       identifier: values.identifier,
//       password: values.password,
//     }, {
//       onSuccess: (user) => {
//         console.log("Login realizado com sucesso:", user); // Log para depuração
//         toast({
//           title: "Login realizado com sucesso",
//           description: `Bem-vindo de volta, ${user.username}!`,
//         });
//         navigate("/"); // Redireciona para a página inicial
//       },
//       onError: (error: Error) => {
//         console.error("Erro ao fazer login:", error); // Log para depuração
//         toast({
//           title: "Erro ao fazer login",
//           description: error.message,
//           variant: "destructive",
//         });
//       },
//     });
//   };

//   const onRegisterSubmit = (values: RegisterFormValues) => {
//     console.log("Tentando criar usuário com os valores:", values); // Log para depuração
  
//     registerMutation.mutate(values, {
//       onSuccess: (user) => {
//         console.log("Usuário criado com sucesso:", user); // Log para depuração
//         toast({
//           title: "Usuário criado com sucesso",
//           description: "Você foi redirecionado para a página inicial.",
//         });
//         navigate("/"); // Redireciona para a página inicial
//       },
//       onError: (error: Error) => {
//         console.error("Erro ao criar usuário:", error); // Log para depuração
//         toast({
//           title: "Erro ao criar usuário",
//           description: error.message,
//           variant: "destructive",
//         });
//       },
//     });
//   };

//   const handleTabChange = (value: string) => {
//     setActiveTab(value);
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen auth-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
//           Relatório de Atividades
//         </h2>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <Card>
//           <CardContent className="pt-6">
//             <Tabs defaultValue="login" value={activeTab} onValueChange={handleTabChange}>
//               <TabsList className="grid w-full grid-cols-2 mb-4">
//                 <TabsTrigger value="login">Entrar</TabsTrigger>
//                 <TabsTrigger value="register">Cadastrar</TabsTrigger>
//               </TabsList>

//               <TabsContent value="login">
//                 <Form {...loginForm}>
//                   <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
//                     <FormField
//                       control={loginForm.control}
//                       name="identifier"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Nome de usuário ou email</FormLabel>
//                           <FormControl>
//                             <Input {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={loginForm.control}
//                       name="password"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Senha</FormLabel>
//                           <FormControl>
//                             <Input type="password" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <div className="flex items-center justify-between">
//                       <FormField
//                         control={loginForm.control}
//                         name="rememberMe"
//                         render={({ field }) => (
//                           <FormItem className="flex items-center space-x-2">
//                             <FormControl>
//                               <Checkbox
//                                 checked={field.value}
//                                 onCheckedChange={field.onChange}
//                               />
//                             </FormControl>
//                             <FormLabel className="text-sm">Lembrar-me</FormLabel>
//                           </FormItem>
//                         )}
//                       />
//                       <Button variant="link" className="text-xs p-0">
//                         Esqueceu a senha?
//                       </Button>
//                     </div>
//                     <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
//                       {loginMutation.isPending ? (
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       ) : null}
//                       Entrar
//                     </Button>
//                   </form>
//                 </Form>
//               </TabsContent>

//               <TabsContent value="register">
//                 <Form {...registerForm}>
//                   <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
//                     <FormField
//                       control={registerForm.control}
//                       name="username"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Nome de usuário</FormLabel>
//                           <FormControl>
//                             <Input {...field} placeholder="apenas letras minúsculas" />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={registerForm.control}
//                       name="email"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Email</FormLabel>
//                           <FormControl>
//                             <Input type="email" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={registerForm.control}
//                       name="password"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Senha</FormLabel>
//                           <FormControl>
//                             <Input type="password" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={registerForm.control}
//                       name="passwordConfirmation"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Confirmar senha</FormLabel>
//                           <FormControl>
//                             <Input type="password" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
//                       {registerMutation.isPending ? (
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       ) : null}
//                       Cadastrar-se
//                     </Button>
//                   </form>
//                 </Form>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  identifier: z.string().min(1, "Usuário ou email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Modificado para incluir firstName e lastName
const registerSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  passwordConfirmation: z.string().min(1, "Confirmação de senha é obrigatória"),
  firstName: z.string().min(1, "Primeiro nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "As senhas não coincidem",
  path: ["passwordConfirmation"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    console.log("Tentando fazer login com os valores:", values);
  
    loginMutation.mutate({
      identifier: values.identifier,
      password: values.password,
    }, {
      onSuccess: (user) => {
        console.log("Login realizado com sucesso:", user);
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo de volta, ${user.username}!`,
        });
        navigate("/");
      },
      onError: (error: Error) => {
        console.error("Erro ao fazer login:", error);
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    console.log("Tentando criar usuário com os valores:", values);
    
    // Extrair os campos necessários para o InsertUser, incluindo firstName e lastName
    const userData: InsertUser = {
      username: values.username,
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
    };
  
    console.log("Dados filtrados para envio:", userData);
    
    registerMutation.mutate(userData, {
      onSuccess: (user) => {
        console.log("Usuário criado com sucesso:", user);
        toast({
          title: "Usuário criado com sucesso",
          description: "Você foi redirecionado para a página inicial.",
        });
        navigate("/");
      },
      onError: (error: Error) => {
        console.error("Erro ao criar usuário:", error);
        toast({
          title: "Erro ao criar usuário",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen auth-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Relatório de Atividades
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="login" value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de usuário ou email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-between">
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-sm">Lembrar-me</FormLabel>
                          </FormItem>
                        )}
                      />
                      <Button variant="link" className="text-xs p-0">
                        Esqueceu a senha?
                      </Button>
                    </div>
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Entrar
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    {/* Campos de Nome e Sobrenome */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sobrenome</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de usuário</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="apenas letras minúsculas" />
                          </FormControl>
                          <p className="text-xs text-gray-500 mt-1">Somente letras minúsculas, sem caracteres especiais</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="passwordConfirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                      onClick={() => console.log("Botão de cadastro clicado")}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Cadastrar-se
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}