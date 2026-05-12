import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface VisibilitySettings {
  show_chatbot: boolean;
  show_portfolio: boolean;
  show_services: boolean;
  show_blog: boolean;
  show_team: boolean;
  show_testimonials: boolean;
  show_enquiry_form: boolean;
}

const DEFAULT_SETTINGS: VisibilitySettings = {
  show_chatbot: true,
  show_portfolio: true,
  show_services: true,
  show_blog: true,
  show_team: true,
  show_testimonials: true,
  show_enquiry_form: true,
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<VisibilitySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'frontend_visibility')
          .single();

        if (data?.value) {
          setSettings(data.value as VisibilitySettings);
        }
      } catch (err) {
        console.error('Error fetching site settings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'site_settings',
          filter: "key=eq.frontend_visibility"
        },
        (payload) => {
          if (payload.new && (payload.new as any).value) {
            setSettings((payload.new as any).value as VisibilitySettings);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { settings, loading };
}
