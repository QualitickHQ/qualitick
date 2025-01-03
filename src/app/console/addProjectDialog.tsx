"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useProject } from "./ProjectContext"
import { addProject } from "./actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PiSpinner } from "react-icons/pi"

interface AddProjectDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddProjectDialog({ isOpen, onClose }: AddProjectDialogProps) {
    const { refreshProjects } = useProject();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm({
        defaultValues: {
            name: '',
        }
    });


    const onSubmit = async (data: { name: string }) => {
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
                                        <Input {...field} />
                                    </FormControl>
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
