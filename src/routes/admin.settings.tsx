import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  MessageSquare, 
  Image as ImageIcon, 
  Briefcase, 
  FileText, 
  Users, 
  Star, 
  Eye, 
  EyeOff,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/settings')({
  component: AdminSettingsPage,
})

interface VisibilitySettings {
  show_chatbot: boolean;
  show_portfolio: boolean;
  show_services: boolean;
  show_blog: boolean;
  show_team: boolean;
  show_testimonials: boolean;
  show_enquiry_form: boolean;
}

const SETTING_ITEMS = [
  { id: 'show_chatbot', label: 'AI Chatbot', description: 'Show/hide the AI concierge bot on all pages', icon: MessageSquare },
  { id: 'show_portfolio', label: 'Portfolio Section', description: 'Display your creative work gallery', icon: ImageIcon },
  { id: 'show_services', label: 'Services Section', description: 'List of professional services offered', icon: Briefcase },
  { id: 'show_blog', label: 'Blog / News', description: 'Latest articles and studio updates', icon: FileText },
  { id: 'show_team', label: 'Team Section', description: 'Showcase your talented team members', icon: Users },
  { id: 'show_testimonials', label: 'Testimonials', description: 'Client reviews and feedback section', icon: Star },
  { id: 'show_enquiry_form', label: 'Enquiry Forms', description: 'Allow users to send business enquiries', icon: MessageSquare },
];

function AdminSettingsPage() {
  const [settings, setSettings] = useState<VisibilitySettings>({
    show_chatbot: true,
    show_portfolio: true,
    show_services: true,
    show_blog: true,
    show_team: true,
    show_testimonials: true,
    show_enquiry_form: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'frontend_visibility')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Table or row doesn't exist, we'll use defaults
          console.warn("Settings not found, using defaults. Please ensure the site_settings table exists.");
        } else {
          throw error;
        }
      } else if (data?.value) {
        setSettings(data.value as VisibilitySettings);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggle(id: keyof VisibilitySettings) {
    const newSettings = { ...settings, [id]: !settings[id] };
    setSettings(newSettings);
    // Auto-save on toggle for better UX
    await saveSettings(newSettings);
  }

  async function saveSettings(settingsToSave: VisibilitySettings) {
    try {
      setIsSaving(true);
      setSaveStatus('idle');
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'frontend_visibility', 
          value: settingsToSave,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading site preferences...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Manage global visibility and frontend feature toggles.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-bold bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20"
            >
              <CheckCircle2 size={14} />
              Saved Successfully
            </motion.div>
          )}
          {saveStatus === 'error' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-bold bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20"
            >
              <AlertCircle size={14} />
              Save Failed
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-xl bg-surface/50 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Eye size={20} />
                <CardTitle className="text-xl">Frontend Visibility</CardTitle>
              </div>
              <CardDescription>Control which sections are visible to your visitors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 divide-y divide-border">
              {SETTING_ITEMS.map((item) => {
                const isVisible = settings[item.id as keyof VisibilitySettings];
                return (
                  <div 
                    key={item.id} 
                    className={cn(
                      "flex items-center justify-between py-6 transition-colors group",
                      !isVisible && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-2xl transition-all duration-500 group-hover:scale-110",
                        isVisible ? "bg-primary/10 text-primary shadow-glow-sm" : "bg-muted text-muted-foreground"
                      )}>
                        <item.icon size={22} />
                      </div>
                      <div>
                        <p className="font-bold tracking-tight">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest hidden sm:block",
                        isVisible ? "text-primary" : "text-muted-foreground"
                      )}>
                        {isVisible ? "Visible" : "Hidden"}
                      </span>
                      <Switch 
                        checked={isVisible}
                        onCheckedChange={() => handleToggle(item.id as keyof VisibilitySettings)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-purple-500/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings size={18} />
                Quick Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                These settings are applied globally across the entire Wings Graphics Studio platform.
              </p>
              <p>
                Changes are saved automatically and synchronized with the live website in real-time.
              </p>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                <strong>Note:</strong> If you hide a section, the data is still preserved in the database, it just won't be visible to users.
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-surface/50 backdrop-blur-xl overflow-hidden group">
            <div className="h-2 w-full bg-primary" />
            <CardContent className="pt-6">
              <p className="text-sm font-bold text-foreground">Experimental Features</p>
              <p className="text-xs text-muted-foreground mt-2 mb-4">New features in development. Use with caution.</p>
              <Button variant="outline" className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
