import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { 
  Plus, 
  Trash2, 
  Eye, 
  Copy, 
  Check, 
  FileText, 
  MoreVertical, 
  ExternalLink, 
  PlusCircle, 
  X, 
  ChevronRight, 
  Globe,
  Loader2,
  List,
  LayoutGrid,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { supabase } from "@/lib/supabase";
import { AdminCard } from "@/components/admin/AdminCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/forms")({ 
  component: AdminFormsPage 
});

interface FormField {
  label: string;
  type: "text" | "textarea" | "email";
  required: boolean;
}

function AdminFormsPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResponsesModalOpen, setIsResponsesModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New form state
  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    slug: "",
    fields: [] as FormField[]
  });

  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms() {
    setLoading(true);
    const { data, error } = await supabase
      .from("custom_forms")
      .select("*, custom_form_responses(count)")
      .order("created_at", { ascending: false });
    if (data) setForms(data);
    setLoading(false);
  }

  async function fetchResponses(formId: string) {
    setLoadingResponses(true);
    const { data, error } = await supabase
      .from("custom_form_responses")
      .select("*")
      .eq("form_id", formId)
      .order("created_at", { ascending: false });
    if (data) setResponses(data);
    setLoadingResponses(false);
  }

  const addField = () => {
    setNewForm(prev => ({
      ...prev,
      fields: [...prev.fields, { label: "", type: "text", required: true }]
    }));
  };

  const removeField = (index: number) => {
    setNewForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    setNewForm(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, ...updates } : f)
    }));
  };

  const handleCreateForm = async () => {
    if (!newForm.title || !newForm.slug || newForm.fields.length === 0) {
      toast.error("Please fill in all required fields and add at least one question.");
      return;
    }

    try {
      const { error } = await supabase
        .from("custom_forms")
        .insert([{
          ...newForm,
          slug: newForm.slug.toLowerCase().replace(/\s+/g, "-")
        }]);

      if (error) throw error;
      toast.success("Form created successfully!");
      setIsCreateModalOpen(false);
      setNewForm({ title: "", description: "", slug: "", fields: [] });
      fetchForms();
    } catch (err: any) {
      toast.error(err.message || "Failed to create form.");
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form and all its responses?")) return;
    
    const { error } = await supabase.from("custom_forms").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Form deleted");
      fetchForms();
    }
  };

  const copyToClipboard = (slug: string) => {
    const url = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Form Builder" 
        desc="Create custom requirement forms to share with your clients." 
        action={
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-brand text-brand-foreground shadow-glow gap-2"
          >
            <Plus size={18} />
            Create New Form
          </Button>
        }
      />

      {loading ? (
        <div className="h-64 grid place-items-center">
          <Loader2 className="size-10 animate-spin text-brand" />
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl border-dashed border-white/10">
          <div className="size-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 text-muted-foreground">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">No forms yet</h3>
          <p className="text-muted-foreground mb-8">Create your first custom form to start gathering client requirements.</p>
          <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>Create Form Now</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <AdminCard key={form.id} className="group relative overflow-hidden border-white/5 hover:border-brand/30 transition-all duration-500">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="size-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-2">
                    <FileText size={24} />
                  </div>
                  <Badge variant="secondary" className="bg-white/5 border-white/10 text-muted-foreground">
                    {form.custom_form_responses[0]?.count || 0} Responses
                  </Badge>
                </div>
                
                <h3 className="text-xl font-bold mb-1 truncate">{form.title}</h3>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                  {form.description || "No description provided."}
                </p>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-10 border-white/10 hover:bg-white/5 gap-2"
                      onClick={() => {
                        setSelectedForm(form);
                        fetchResponses(form.id);
                        setIsResponsesModalOpen(true);
                      }}
                    >
                      <Eye size={14} />
                      Responses
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-10 w-10 border-white/10 hover:bg-white/5"
                      onClick={() => copyToClipboard(form.slug)}
                    >
                      {copiedId === form.slug ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-10 w-10 border-white/10 hover:bg-red-500/10 hover:text-red-500"
                      onClick={() => handleDeleteForm(form.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <a 
                    href={`/f/${form.slug}`} 
                    target="_blank" 
                    className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-brand transition-colors pt-1"
                  >
                    View Public Page <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="glass border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <PlusCircle className="text-brand" />
              Build Custom Form
            </DialogTitle>
            <DialogDescription>
              Define the questions you want your client to answer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Form Title</Label>
                <Input 
                  placeholder="e.g. Logo Design Brief" 
                  value={newForm.title}
                  onChange={(e) => setNewForm(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Custom URL Slug</Label>
                <Input 
                  placeholder="e.g. logo-brief-client-x" 
                  value={newForm.slug}
                  onChange={(e) => setNewForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description (Optional)</Label>
              <Textarea 
                placeholder="Tell the client why they are filling this out..." 
                value={newForm.description}
                onChange={(e) => setNewForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white/5 border-white/10 resize-none h-20"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-widest text-brand">Questions / Fields</Label>
                <Button variant="ghost" size="sm" onClick={addField} className="h-8 gap-1.5 text-brand hover:bg-brand/10">
                  <Plus size={14} /> Add Question
                </Button>
              </div>

              <div className="space-y-3">
                {newForm.fields.map((field, idx) => (
                  <div key={idx} className="flex gap-3 items-end p-4 rounded-xl bg-white/5 border border-white/5 relative group">
                    <div className="flex-1 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Question Text</Label>
                      <Input 
                        value={field.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        placeholder="What is your business name?"
                        className="bg-background border-white/10 h-9 text-sm"
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Type</Label>
                      <Select 
                        value={field.type} 
                        onValueChange={(val: any) => updateField(idx, { type: val })}
                      >
                        <SelectTrigger className="bg-background border-white/10 h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass">
                          <SelectItem value="text">Single Line</SelectItem>
                          <SelectItem value="textarea">Paragraph</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeField(idx)}
                      className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-brand text-brand-foreground shadow-glow px-8" onClick={handleCreateForm}>
              Publish Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Responses Modal */}
      <Dialog open={isResponsesModalOpen} onOpenChange={setIsResponsesModalOpen}>
        <DialogContent className="glass border-white/10 max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Eye className="text-brand" />
              Submissions: {selectedForm?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pt-4 space-y-6 pr-2">
            {loadingResponses ? (
              <div className="h-64 grid place-items-center">
                <Loader2 className="size-8 animate-spin text-brand" />
              </div>
            ) : responses.length === 0 ? (
              <div className="text-center py-20 glass rounded-2xl border-dashed border-white/10">
                <p className="text-muted-foreground">No submissions yet for this form.</p>
              </div>
            ) : (
              responses.map((resp, idx) => (
                <div key={resp.id} className="glass rounded-2xl border border-white/10 overflow-hidden">
                  <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex justify-between items-center">
                    <span className="text-xs font-bold text-brand uppercase tracking-widest">Submission #{responses.length - idx}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{new Date(resp.created_at).toLocaleString()}</span>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(resp.data).map(([key, value]: [string, any]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">{key}</Label>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
