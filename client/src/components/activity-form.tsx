import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ActivityType, InsertActivity, insertActivitySchema, Activity } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Loader2, BookOpen, Home, Mail, MessageSquare } from "lucide-react";

// Form schema
const formSchema = insertActivitySchema.extend({
  date: z.coerce.date(),
  hours: z.coerce
    .number()
    .min(0.5, "O valor mínimo é 0.5 horas")
    .max(24, "O valor máximo é 24 horas")
    .step(0.5, "Incrementos de 0.5 horas apenas")
});

type FormValues = z.infer<typeof formSchema>;

// Activity icons
const ActivityIcons = {
  [ActivityType.CAMPO]: <Home className="h-6 w-6 text-primary" />,
  [ActivityType.TESTEMUNHO]: <MessageSquare className="h-6 w-6 text-primary" />,
  [ActivityType.CARTAS]: <Mail className="h-6 w-6 text-primary" />,
  [ActivityType.ESTUDO]: <BookOpen className="h-6 w-6 text-primary" />
};

// Activity form component
interface ActivityFormProps {
  onSave?: () => void;
  initialDate: Date;
  activityToEdit?: Activity | null;
}

export function ActivityForm({ onSave, initialDate, activityToEdit }: ActivityFormProps) {
  const { toast } = useToast();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: activityToEdit ? {
      // Garantindo que o tipo está entre os valores permitidos
      type: isValidActivityType(activityToEdit.type) ? activityToEdit.type : ActivityType.CAMPO,
      date: new Date(activityToEdit.date),
      hours: Number(activityToEdit.hours),
      notes: activityToEdit.notes || ""
    } : {
      type: ActivityType.CAMPO,
      date: initialDate || new Date(),
      hours: 0,
      notes: ""
    }
  });
  
  // Helper to check if the activity type is valid
  function isValidActivityType(type: string): type is typeof ActivityType[keyof typeof ActivityType] {
    return Object.values(ActivityType).includes(type as any);
  }
  
  // Update form when initialDate changes
  useEffect(() => {
    form.setValue("date", initialDate);
  }, [initialDate, form]);

  // Save activity mutation
  const saveMutation = useMutation({
    mutationFn: async (data: InsertActivity) => {
      const method = activityToEdit ? "PUT" : "POST";
      const url = activityToEdit 
        ? `/api/activities/${activityToEdit.id}` 
        : "/api/activities";
      const res = await apiRequest(method, url, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Atividade salva",
        description: "Sua atividade foi registrada com sucesso."
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities/month"] });
      
      if (onSave) {
        onSave();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    const formData = {
      ...values,
      hours: Number(values.hours),
      date: new Date(values.date)
    };
    saveMutation.mutate(formData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Registrar nova atividade</DialogTitle>
        <DialogDescription>
          Preencha os detalhes da sua atividade de serviço para registrar no relatório.
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de atividade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de atividade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ActivityType.CAMPO} className="flex items-center">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2" />
                        <span>Campo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={ActivityType.TESTEMUNHO}>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span>Testemunho informal</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={ActivityType.CARTAS}>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Cartas</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={ActivityType.ESTUDO}>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span>Estudo</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : new Date();
                      field.onChange(date);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      {...field}
                      className="pr-16"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                      horas
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações (opcional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Detalhes adicionais sobre esta atividade"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Salvar
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
