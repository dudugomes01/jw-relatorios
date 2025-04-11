// import { useState, useEffect } from "react";
// import { useLocation } from "wouter";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { UserRole } from "@shared/schema";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   FormDescription,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Header } from "@/components/layout/header";
// import { NavigationBar } from "@/components/layout/navigation-bar";
// import { Loader2 } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/hooks/use-auth"; // Importação do hook de autenticação

// // Form schema for user settings
// const formSchema = z.object({
//   firstName: z.string().min(1, "Nome é obrigatório"),
//   lastName: z.string().min(1, "Sobrenome é obrigatório"),
//   email: z.string().email("Email inválido"),
//   role: z.enum([
//     UserRole.PUBLICADOR,
//     UserRole.PIONEIRO_AUXILIAR,
//     UserRole.PIONEIRO_REGULAR,
//   ]),
// });

// type FormValues = z.infer<typeof formSchema>;

// export default function SettingsPage() {
//   const [, navigate] = useLocation();
//   const { toast } = useToast();
//   const { user, logoutMutation, updateUserMutation, isLoading } = useAuth(); // Hook para autenticação
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Redirecionar se o usuário não estiver autenticado
//   useEffect(() => {
//     if (!user && !isLoading) {
//       navigate("/auth");
//     }
//   }, [user, isLoading, navigate]);

//   // Configurar o formulário com os dados do usuário autenticado
//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       firstName: user?.firstName || "",
//       lastName: user?.lastName || "",
//       email: user?.email || "",
//       role:
//         (user?.role as (typeof UserRole)[keyof typeof UserRole]) ||
//         UserRole.PUBLICADOR,
//     },
//   });

//   // Handle form submission
//   const onSubmit = (values: FormValues) => {
//     setIsSubmitting(true);
  
//     updateUserMutation.mutate(values, {
//       onSuccess: () => {
//         toast({
//           title: "Configurações salvas",
//           description: "Suas preferências foram atualizadas com sucesso.",
//         });
  
//         form.reset(values);
  
//         setIsSubmitting(false);
//       },
//       onError: (error: Error) => {
//         toast({
//           title: "Erro ao salvar configurações",
//           description: error.message,
//           variant: "destructive",
//         });
//         setIsSubmitting(false);
//       },
//     });
//   };

//   // Handle logout
//   const handleLogout = () => {
//     logoutMutation.mutate(undefined, {
//       onSuccess: () => {
//         navigate("/auth"); // Redireciona para a página de login após o logout
//       },
//     });
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col min-h-screen">
//       <Header />
//       <NavigationBar />

//       <main className="flex-1 overflow-y-auto bg-gray-50">
//         <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
//           {/* User Profile */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Perfil do usuário</CardTitle>
//               <CardDescription>
//                 Informações pessoais e configurações
//               </CardDescription>
//             </CardHeader>

//             <CardContent>
//               <Form {...form}>
//                 <form
//                   onSubmit={form.handleSubmit(onSubmit)}
//                   className="space-y-6"
//                 >
//                   <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//                     <FormField
//                       control={form.control}
//                       name="firstName"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Nome</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Seu nome" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="lastName"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Sobrenome</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Seu sobrenome" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </div>

//                   <FormField
//                     control={form.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Email</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="email"
//                             placeholder="seu.email@exemplo.com"
//                             {...field}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="role"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Seu papel</FormLabel>
//                         <Select
//                           onValueChange={field.onChange}
//                           defaultValue={field.value}
//                         >
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Selecione seu papel" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value={UserRole.PUBLICADOR}>
//                               Publicador
//                             </SelectItem>
//                             <SelectItem value={UserRole.PIONEIRO_AUXILIAR}>
//                               Pioneiro Auxiliar
//                             </SelectItem>
//                             <SelectItem value={UserRole.PIONEIRO_REGULAR}>
//                               Pioneiro Regular
//                             </SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <FormDescription>
//                           Esta configuração determina suas metas mensais de
//                           horas.
//                         </FormDescription>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <div className="flex justify-end space-x-2">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => navigate("/")}
//                       disabled={!form.formState.isDirty} // Desabilita o botão se o formulário não foi alterado
//                     >
//                       Cancelar
//                     </Button>
//                     <Button
//                       type="submit"
//                       disabled={isSubmitting || !form.formState.isDirty} // Desabilita o botão se o formulário não foi alterado ou está enviando
//                     >
//                       {isSubmitting ? (
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       ) : null}
//                       Salvar
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="destructive"
//                       onClick={handleLogout}
//                     >
//                       Sair
//                     </Button>
//                   </div>
//                 </form>
//               </Form>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { NavigationBar } from "@/components/layout/navigation-bar";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth"; // Importação do hook de autenticação

// Form schema for user settings
const formSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  role: z.enum([
    UserRole.PUBLICADOR,
    UserRole.PIONEIRO_AUXILIAR,
    UserRole.PIONEIRO_REGULAR,
  ]),
});

type FormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, logoutMutation, updateUserMutation, isLoading } = useAuth(); // Hook para autenticação
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirecionar se o usuário não estiver autenticado
  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  // Configurar o formulário com os dados do usuário autenticado
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      role:
        (user?.role as (typeof UserRole)[keyof typeof UserRole]) ||
        UserRole.PUBLICADOR,
    },
  });

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    
    // Verificar se o papel (role) foi alterado
    const roleChanged = user?.role !== values.role;
  
    updateUserMutation.mutate(values, {
      onSuccess: () => {
        toast({
          title: "Configurações salvas",
          description: "Suas preferências foram atualizadas com sucesso.",
        });
  
        form.reset(values);
        setIsSubmitting(false);
        
        // Se o papel (role) foi alterado, recarregar a página
        if (roleChanged) {
          window.location.reload();
        }
      },
      onError: (error: Error) => {
        toast({
          title: "Erro ao salvar configurações",
          description: error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
      },
    });
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/auth"); // Redireciona para a página de login após o logout
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <NavigationBar />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil do usuário</CardTitle>
              <CardDescription>
                Informações pessoais e configurações
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu sobrenome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu.email@exemplo.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seu papel</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione seu papel" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UserRole.PUBLICADOR}>
                              Publicador
                            </SelectItem>
                            <SelectItem value={UserRole.PIONEIRO_AUXILIAR}>
                              Pioneiro Auxiliar
                            </SelectItem>
                            <SelectItem value={UserRole.PIONEIRO_REGULAR}>
                              Pioneiro Regular
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Esta configuração determina suas metas mensais de
                          horas.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/")}
                      disabled={!form.formState.isDirty} // Desabilita o botão se o formulário não foi alterado
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !form.formState.isDirty} // Desabilita o botão se o formulário não foi alterado ou está enviando
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}