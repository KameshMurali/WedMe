"use client";

import { useFieldArray, useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Option = { value: string; label: string };
type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "textarea" | "url" | "datetime-local" | "checkbox" | "select" | "array-text";
  placeholder?: string;
  options?: Option[];
};

type ActionResult = { error?: string; success?: string };

export function ArrayEditor({
  title,
  description,
  fields,
  items,
  emptyItem,
  onSave,
}: {
  title: string;
  description: string;
  fields: FieldConfig[];
  items: Array<Record<string, unknown>>;
  emptyItem: Record<string, unknown>;
  onSave: (previousState: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { control, register, handleSubmit } = useForm<{ items: Array<Record<string, unknown>> }>({
    defaultValues: { items },
  });
  const { fields: rows, append, remove, move } = useFieldArray({
    control,
    name: "items" as const,
  });

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.append("items", JSON.stringify(values.items));

    startTransition(async () => {
      const result = await onSave({}, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Saved");
      router.refresh();
    });
  });

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-4xl text-[color:var(--text)]">{title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => append(JSON.parse(JSON.stringify(emptyItem)) as Record<string, unknown>)}
        >
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        {rows.map((row, index) => (
          <Card key={row.id} className="border border-black/6 bg-white/70">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Item {index + 1}
              </p>
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => index > 0 && move(index, index - 1)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => index < rows.length - 1 && move(index, index + 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => {
                const fieldName = `items.${index}.${field.name}` as const;

                if (field.type === "textarea") {
                  return (
                    <label key={field.name} className="space-y-2 md:col-span-2">
                      <span className="text-sm text-[color:var(--muted)]">{field.label}</span>
                      <Textarea placeholder={field.placeholder} {...register(fieldName as never)} />
                    </label>
                  );
                }

                if (field.type === "select") {
                  return (
                    <label key={field.name} className="space-y-2">
                      <span className="text-sm text-[color:var(--muted)]">{field.label}</span>
                      <select
                        {...register(fieldName as never)}
                        className="h-12 w-full rounded-2xl border border-black/10 bg-white/85 px-4"
                      >
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                }

                if (field.type === "checkbox") {
                  return (
                    <label key={field.name} className="flex items-center gap-3 rounded-2xl border border-black/8 bg-white/70 px-4 py-3 text-sm">
                      <input type="checkbox" {...register(fieldName as never)} />
                      {field.label}
                    </label>
                  );
                }

                if (field.type === "array-text") {
                  return (
                    <label key={field.name} className="space-y-2 md:col-span-2">
                      <span className="text-sm text-[color:var(--muted)]">{field.label}</span>
                      <Controller
                        control={control}
                        name={fieldName as never}
                        render={({ field: controllerField }) => (
                          <Input
                            placeholder={field.placeholder}
                            value={
                              Array.isArray(controllerField.value)
                                ? (controllerField.value as string[]).join(", ")
                                : ""
                            }
                            onChange={(event) =>
                              controllerField.onChange(
                                event.target.value
                                  .split(",")
                                  .map((value) => value.trim())
                                  .filter(Boolean),
                              )
                            }
                          />
                        )}
                      />
                    </label>
                  );
                }

                return (
                  <label key={field.name} className="space-y-2">
                    <span className="text-sm text-[color:var(--muted)]">{field.label}</span>
                    <Input type={field.type} placeholder={field.placeholder} {...register(fieldName as never)} />
                  </label>
                );
              })}
            </div>
          </Card>
        ))}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : `Save ${title.toLowerCase()}`}
        </Button>
      </form>
    </Card>
  );
}
