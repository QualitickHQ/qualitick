"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useProject } from "./ProjectContext"
import { addProject } from "./actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PiSpinner } from "react-icons/pi"

interface AddProjectDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

// Add this schema definition
const projectSchema = z.object({
    name: z.string()
        .min(3, "Project name must be at least 3 characters")
        .nonempty("Project name is required"),
})

// Infer the type from the schema
type ProjectFormValues = z.infer<typeof projectSchema>

export function AddProjectDialog({ isOpen, onClose }: AddProjectDialogProps) {
    const { refreshProjects } = useProject();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<ProjectFormValues>({
        defaultValues: {
            name: '',
        },
        resolver: zodResolver(projectSchema)
    });

    const onSubmit = async (data: ProjectFormValues) => {
        setIsSubmitting(true);
        try {
            await addProject(data);
            await refreshProjects();
            onClose();
            form.reset();
        } catch (error) {
            console.error('Error adding project:', error);
            // Handle error (e.g., show error message)
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Project</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Project Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <PiSpinner className="mr-2 h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    'Add Project'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
