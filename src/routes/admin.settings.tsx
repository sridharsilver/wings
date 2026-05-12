import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Loader2,
  CheckCircle2,
  AlertCircle,
  Map as MapIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Globe,
  Database
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  show_contact_map: boolean;
  whatsapp_number: string;
  whatsapp_message: string;
  studio_address: string;
  contact_phone: string;
  contact_email: string;
  working_hours: string;
}

const VISIBILITY_GROUPS = [
  {
    id: 'global',
    label: 'Global Features',
    icon: Globe,
    items: [
      { id: 'show_chatbot', label: 'AI Chatbot', description: 'Show/hide the AI concierge bot on all pages', icon: MessageSquare },
    ]
  },
  {
    id: 'home',
    label: 'Home Page Sections',
    icon: HomeIcon,
    items: [
      { id: 'show_portfolio', label: 'Portfolio Section', description: 'Display your creative work gallery', icon: ImageIcon },
      { id: 'show_services', label: 'Services Section', description: 'List of professional services offered', icon: Briefcase },
      { id: 'show_blog', label: 'Blog / News', description: 'Latest articles and studio updates', icon: FileText },
      { id: 'show_team', label: 'Team Section', description: 'Showcase your talented team members', icon: Users },
      { id: 'show_testimonials', label: 'Testimonials', description: 'Client reviews and feedback section', icon: Star },
    ]
  },
  {
    id: 'contact',
    label: 'Contact Page Features',
    icon: PhoneIcon,
    items: [
      { id: 'show_enquiry_form', label: 'Enquiry Forms', description: 'Allow users to send business enquiries', icon: MessageSquare },
      { id: 'show_contact_map', label: 'Google Map', description: 'Show/hide the studio location map', icon: MapIcon },
    ]
  }
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
    show_contact_map: true,
    whatsapp_number: '919951979988',
    whatsapp_message: "Hi Wings Design Studio! I'm interested in your services.",
    studio_address: 'SRT 12, Sanath Nagar, Hyderabad, TS 500018',
    contact_phone: '+91 9951979988',
    contact_email: 'hello@wingsgraphics.in',
    working_hours: 'Mon–Sat · 10:00 — 19:00',
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
        .maybeSingle();

      if (error) {
        throw error;
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
    await saveSettings(newSettings);
  }

  async function handleValueChange(id: keyof VisibilitySettings, value: string) {
    const newSettings = { ...settings, [id]: value };
    setSettings(newSettings);
  }

  async function handleSave() {
    await saveSettings(settings);
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground mt-1">Manage global visibility and site-wide information.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {saveStatus === 'success' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-bold bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20"
            >
              <CheckCircle2 size={14} />
              Saved
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

      <Tabs defaultValue="visibility" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-surface/50 p-1 rounded-2xl border border-border/50">
          <TabsTrigger value="visibility" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Eye size={16} />
            Visibility
          </TabsTrigger>
          <TabsTrigger value="data" className="rounded-xl flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Database size={16} />
            Site Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visibility" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-xl bg-surface/50 backdrop-blur-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Eye size={20} className="text-primary" />
                    Frontend Visibility
                  </CardTitle>
                  <CardDescription>Toggle major website components on or off.</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Accordion type="single" collapsible className="w-full">
                    {VISIBILITY_GROUPS.map((group) => (
                      <AccordionItem key={group.id} value={group.id} className="border-b-0 mb-4 bg-foreground/5 rounded-2xl overflow-hidden">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-foreground/5 transition-colors group">
                          <div className="flex items-center gap-3 text-left">
                            <div className="p-2 rounded-xl bg-background text-primary">
                              <group.icon size={18} />
                            </div>
                            <span className="font-bold text-base">{group.label}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4 pt-2">
                          <div className="space-y-4">
                            {group.items.map((item) => {
                              const isVisible = settings[item.id as keyof VisibilitySettings];
                              return (
                                <div 
                                  key={item.id} 
                                  className={cn(
                                    "flex items-center justify-between py-3 rounded-xl px-4 transition-all duration-300",
                                    isVisible ? "bg-background shadow-sm border border-border/50" : "bg-transparent opacity-60"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "p-2 rounded-lg transition-all duration-500",
                                      isVisible ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                    )}>
                                      <item.icon size={18} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold tracking-tight">{item.label}</p>
                                      <p className="text-[10px] text-muted-foreground leading-tight">{item.description}</p>
                                    </div>
                                  </div>
                                  <Switch 
                                    checked={isVisible}
                                    onCheckedChange={() => handleToggle(item.id as keyof VisibilitySettings)}
                                    className="data-[state=checked]:bg-primary scale-90"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-purple-500/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Visibility Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  Hiding sections can help you clean up the page during maintenance or if a specific feature is temporarily unavailable.
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-xl bg-surface/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Database size={20} className="text-primary" />
                    Site Information
                  </CardTitle>
                  <CardDescription>Update phone numbers, address and other site-wide data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* WhatsApp Group */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-primary">
                      <MessageSquare size={16} />
                      WhatsApp Business
                    </h3>
                    <div className="grid gap-6 p-6 rounded-2xl bg-foreground/5 border border-border/50">
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp_number" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">WhatsApp Number</Label>
                        <Input 
                          id="whatsapp_number"
                          value={settings.whatsapp_number}
                          onChange={(e) => handleValueChange('whatsapp_number', e.target.value)}
                          onBlur={handleSave}
                          className="rounded-xl border-none bg-background focus-visible:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp_message" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Default Message</Label>
                        <Textarea 
                          id="whatsapp_message"
                          value={settings.whatsapp_message}
                          onChange={(e) => handleValueChange('whatsapp_message', e.target.value)}
                          onBlur={handleSave}
                          className="rounded-xl border-none bg-background focus-visible:ring-primary min-h-[100px] resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Info Group */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-primary">
                      <PhoneIcon size={16} />
                      Contact Details
                    </h3>
                    <div className="grid gap-6 p-6 rounded-2xl bg-foreground/5 border border-border/50">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact_phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Studio Phone</Label>
                          <Input 
                            id="contact_phone"
                            value={settings.contact_phone}
                            onChange={(e) => handleValueChange('contact_phone', e.target.value)}
                            onBlur={handleSave}
                            className="rounded-xl border-none bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact_email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Studio Email</Label>
                          <Input 
                            id="contact_email"
                            value={settings.contact_email}
                            onChange={(e) => handleValueChange('contact_email', e.target.value)}
                            onBlur={handleSave}
                            className="rounded-xl border-none bg-background"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studio_address" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Studio Address</Label>
                        <Input 
                          id="studio_address"
                          value={settings.studio_address}
                          onChange={(e) => handleValueChange('studio_address', e.target.value)}
                          onBlur={handleSave}
                          className="rounded-xl border-none bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="working_hours" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Working Hours</Label>
                        <Input 
                          id="working_hours"
                          value={settings.working_hours}
                          onChange={(e) => handleValueChange('working_hours', e.target.value)}
                          onBlur={handleSave}
                          className="rounded-xl border-none bg-background"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="border-none shadow-xl bg-gradient-to-br from-primary/5 to-purple-500/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Data Management</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  All site info updates are saved automatically when you click out of an input field. Changes reflect instantly on your live website.
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
