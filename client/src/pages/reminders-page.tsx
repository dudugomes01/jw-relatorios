import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Header } from "@/components/layout/header";
import { NavigationBar } from "@/components/layout/navigation-bar";
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";
import type { Reminder, InsertReminder } from "@shared/schema";

// Form validation schema
const reminderFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  date: z.date({
    required_error: "Data é obrigatória",
  }),
  description: z.string().optional(),
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

export default function RemindersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Form definition
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Fetch reminders
  const { data: reminders = [], isLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    refetchOnWindowFocus: false,
  });

  // Mutations
  const createReminderMutation = useMutation({
    mutationFn: async (data: InsertReminder) => {
      const res = await apiRequest("POST", "/api/reminders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Lembrete criado",
        description: "Seu lembrete foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertReminder }) => {
      const res = await apiRequest("PUT", `/api/reminders/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      setIsDialogOpen(false);
      setEditingReminder(null);
      form.reset();
      toast({
        title: "Lembrete atualizado",
        description: "Seu lembrete foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Lembrete removido",
        description: "Seu lembrete foi removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtered reminders: all events in the future or all events for current month
  const filteredReminders = reminders.filter((reminder) => {
    const reminderDate = new Date(reminder.date);
    const today = new Date();
    
    // Mostra todos os eventos futuros
    return reminderDate >= today;
  });

  // Handle form submission
  const onSubmit = (values: ReminderFormValues) => {
    if (editingReminder) {
      updateReminderMutation.mutate({ id: editingReminder.id, data: values });
    } else {
      createReminderMutation.mutate(values);
    }
  };

  // Handle reminder edit
  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    form.reset({
      title: reminder.title,
      date: new Date(reminder.date),
      description: reminder.description || "",
    });
    setIsDialogOpen(true);
  };

  // Handle new reminder
  const handleNewReminder = () => {
    setEditingReminder(null);
    form.reset({
      title: "",
      date: new Date(),
      description: "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div>
      <Header />
      <NavigationBar />
      <main className="container p-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Lembretes</h1>
          <Button onClick={handleNewReminder}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Lembrete
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => date && setCurrentDate(date)}
                className="rounded-md border"
                locale={ptBR}
                modifiers={{
                  highlighted: reminders.map(reminder => new Date(reminder.date)),
                }}
                modifiersStyles={{
                  highlighted: {
                    backgroundColor: "rgba(220, 38, 38, 0.1)",
                    color: "var(--primary)",
                    fontWeight: "bold",
                    borderRadius: "100%"
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                Próximos Lembretes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredReminders.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Nenhum lembrete futuro encontrado. Crie um novo lembrete!
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex justify-between items-start p-4 rounded-lg border"
                    >
                      <div>
                        <h3 className="font-medium">{reminder.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(reminder.date), "dd 'de' MMMM 'de' yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                        {reminder.description && (
                          <p className="mt-2 text-sm">{reminder.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditReminder(reminder)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteReminderMutation.mutate(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingReminder ? "Editar Lembrete" : "Novo Lembrete"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Limpeza do Salão" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                      locale={ptBR}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione detalhes sobre o evento..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {createReminderMutation.isPending || updateReminderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {editingReminder ? "Atualizar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}