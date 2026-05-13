import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { Section } from "@/components/site/Section";
import { PageHero } from "@/components/site/PageHero";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/f/$slug")({
  component: PublicFormPage,
});

function PublicFormPage() {
  const { slug } = Route.useParams();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchForm();
  }, [slug]);

  async function fetchForm() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("custom_forms")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError("This link has expired or doesn't exist.");
        return;
      }

      setForm(data);
      // Initialize form data
      const initialData: Record<string, string> = {};
      data.fields.forEach((field: any) => {
        initialData[field.label] = "";
      });
      setFormData(initialData);
    } catch (err: any) {
      setError(err.message || "Failed to load the form.");
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (label: string, value: string) => {
    setFormData(prev => ({ ...prev, [label]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("custom_form_responses")
        .insert([{
          form_id: form.id,
          data: formData
        }]);

      if (error) throw error;
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="size-10 animate-spin text-brand" />
          <p className="text-muted-foreground animate-pulse font-medium">Preparing your custom brief...</p>
        </div>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="size-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-3">Link Invalid</h1>
          <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
          <Button variant="ghost" className="mt-8" onClick={() => window.location.href = "/"}>
            Return to Homepage
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Custom Requirement Form"
        title={form.title}
        desc={form.description || "Please fill in the details below so we can move forward with your project."}
      />

      <Section>
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 glass rounded-3xl p-8 border border-brand/20 shadow-glow shadow-brand/5"
              >
                <div className="size-20 mx-auto rounded-full bg-gradient-brand flex items-center justify-center text-brand-foreground mb-6 shadow-glow">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gradient">Information Received!</h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Thank you for providing these details. Our team will review them and get back to you shortly.
                </p>
                <Button onClick={() => window.location.href = "/"} variant="outline" className="rounded-full px-8">
                  Back to Website
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8 md:p-10 border border-white/10 shadow-elegant"
              >
                <form onSubmit={handleSubmit} className="space-y-8">
                  {form.fields.map((field: any, idx: number) => (
                    <div key={idx} className="space-y-3">
                      <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">
                        {field.label} {field.required && <span className="text-brand">*</span>}
                      </Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          required={field.required}
                          value={formData[field.label] || ""}
                          onChange={(e) => handleInputChange(field.label, e.target.value)}
                          placeholder="Type your answer here..."
                          className="min-h-[120px] bg-white/5 border-white/10 rounded-2xl focus:ring-brand/50 focus:border-brand/50 transition-all text-base"
                        />
                      ) : (
                        <Input
                          required={field.required}
                          type={field.type || "text"}
                          value={formData[field.label] || ""}
                          onChange={(e) => handleInputChange(field.label, e.target.value)}
                          placeholder="Type your answer here..."
                          className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-brand/50 focus:border-brand/50 transition-all text-base"
                        />
                      )}
                    </div>
                  ))}

                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-14 rounded-2xl bg-gradient-brand text-brand-foreground font-bold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all text-lg flex items-center justify-center gap-3"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Details
                          <ArrowRight size={20} />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>
    </SiteLayout>
  );
}
