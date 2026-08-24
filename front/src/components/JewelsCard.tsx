import * as React from "react";
import { Gem, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { JEWEL_TYPES, jewelsApi, type JewelResponse, type JewelType } from "@/lib/api";

const pretty = (t: JewelType) => t.charAt(0) + t.slice(1).toLowerCase();

export function JewelsCard({ loanId }: { loanId: string }) {
  const id = Number(loanId);
  const [jewels, setJewels] = React.useState<JewelResponse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    jewelType: "CHAIN" as JewelType,
    weight: "",
    quantity: "1",
    description: "",
  });
  const [files, setFiles] = React.useState<File[]>([]);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const previews = React.useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  React.useEffect(
    () => () => previews.forEach((u) => URL.revokeObjectURL(u)),
    [previews],
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setJewels(await jewelsApi.list(id));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const add = async () => {
    if (!form.weight || Number(form.weight) <= 0) {
      toast.error("Enter a valid weight in grams");
      return;
    }
    setSaving(true);
    try {
      await jewelsApi.create(
        id,
        {
          jewelType: form.jewelType,
          weight: Number(form.weight),
          quantity: Number(form.quantity) || 1,
          description: form.description.trim(),
        },
        files,
      );
      toast.success("Jewel added");
      setOpen(false);
      setForm({ jewelType: "CHAIN", weight: "", quantity: "1", description: "" });
      setFiles([]);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (jewelId: number) => {
    if (!window.confirm("Delete this jewel and its photos? This cannot be undone.")) return;
    setDeletingId(jewelId);
    try {
      await jewelsApi.remove(id, jewelId);
      toast.success("Jewel deleted");
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const totalWeight = jewels.reduce((s, j) => s + Number(j.weight ?? 0), 0);

  return (
    <Card className="rounded-2xl border-border/70 shadow-soft">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gem className="size-4 text-gold" /> Pledged jewels
          {jewels.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {jewels.length} item{jewels.length > 1 ? "s" : ""} · {totalWeight.toFixed(2)} g
            </span>
          )}
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="rounded-xl">
              <Plus /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a jewel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.jewelType}
                  onValueChange={(v) => setForm((f) => ({ ...f, jewelType: v as JewelType }))}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JEWEL_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {pretty(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (g)</Label>
                  <Input
                    id="weight"
                    inputMode="decimal"
                    className="h-11 rounded-xl"
                    value={form.weight}
                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    inputMode="numeric"
                    className="h-11 rounded-xl"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  className="h-11 rounded-xl"
                  placeholder="22K thin chain"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Photos</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const picked = Array.from(e.target.files ?? []).filter((f) =>
                      f.type.startsWith("image/"),
                    );
                    setFiles((p) => [...p, ...picked]);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImagePlus /> Upload images
                </Button>
                {previews.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {previews.map((src, i) => (
                      <div key={src} className="relative">
                        <img
                          src={src}
                          alt={`Jewel photo ${i + 1}`}
                          className="size-16 rounded-lg border object-cover"
                        />
                        <button
                          type="button"
                          aria-label="Remove photo"
                          className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                          onClick={() => setFiles((p) => p.filter((_, x) => x !== i))}
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button className="rounded-xl shadow-gold" disabled={saving} onClick={() => void add()}>
                {saving && <Loader2 className="animate-spin" />} Add jewel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading jewels…</p>
        ) : jewels.length === 0 ? (
          <p className="text-sm text-muted-foreground">No jewels recorded for this loan yet.</p>
        ) : (
          <ul className="divide-y">
            {jewels.map((j) => (
              <li key={j.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {pretty(j.jewelType)} × {j.quantity}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {Number(j.weight ?? 0).toFixed(2)} g{j.description ? ` · ${j.description}` : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    disabled={deletingId === j.id}
                    aria-label="Delete jewel"
                    onClick={() => void remove(j.id)}
                  >
                    {deletingId === j.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
                {(j.imageUrls?.length ?? 0) > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {j.imageUrls?.map((src, i) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => setPreview(src)}
                        className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <img
                          src={src}
                          alt={`${pretty(j.jewelType)} photo ${i + 1}`}
                          loading="lazy"
                          className="size-16 rounded-lg border object-cover transition hover:opacity-90"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-2">
          <DialogHeader className="sr-only">
            <DialogTitle>Jewel photo</DialogTitle>
          </DialogHeader>
          {preview && (
            <img src={preview} alt="Jewel photo" className="w-full rounded-xl object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
