import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { UserRole, UpdateUser } from "@shared/schema";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { NavigationTabs } from "@/components/layout/navigation-tabs";
import { Loader2 } from "lucide-react";

// Form schema for user settings
const formSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum([
    UserRole.PUBLICADOR, 
    UserRole.PIONEIRO_AUXILIAR, 
    UserRole.PIONEIRO_REGULAR
  ])
});

type FormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const [, navigate] = useLocation();
  const { user, updateUserMutation } = useAuth();
  
  // Form setup with user data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
      role: user?.role as UserRole.PUBLICADOR || UserRole.PUBLICADOR
    }
  });

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    // Only send role to the API
    const updateData: UpdateUser = {
      role: values.role
    };
    
    updateUserMutation.mutate(updateData);
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <NavigationTabs activeTab="settings" />
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil do usuário</CardTitle>
              <CardDescription>Informações pessoais e configurações</CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            disabled
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
                            <SelectItem value={UserRole.PUBLICADOR}>Publicador</SelectItem>
                            <SelectItem value={UserRole.PIONEIRO_AUXILIAR}>Pioneiro Auxiliar</SelectItem>
                            <SelectItem value={UserRole.PIONEIRO_REGULAR}>Pioneiro Regular</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Esta configuração determina suas metas mensais de horas.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="mr-2"
                      onClick={() => navigate("/")}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateUserMutation.isPending}
                    >
                      {updateUserMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Salvar
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
