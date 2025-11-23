import { toast } from "@/hooks/use-toast";

export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
  });
};

export const showErrorToast = (error: any, title: string = "Error") => {
  const description = error?.message || "An unexpected error occurred";
  toast({
    title,
    description,
    variant: "destructive",
  });
};

export const showLoadingToast = (message: string) => {
  toast({
    title: "Loading",
    description: message,
  });
};

export const showDeleteSuccessToast = (entityName: string) => {
  toast({
    title: "Deleted",
    description: `${entityName} has been deleted successfully`,
  });
};

export const showSaveSuccessToast = (entityName: string) => {
  toast({
    title: "Saved",
    description: `${entityName} has been saved successfully`,
  });
};
