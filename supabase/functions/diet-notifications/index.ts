import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find diets with active subscriptions that need notification
    const now = new Date().toISOString();
    const { data: diets, error } = await supabase
      .from("saved_diets")
      .select("*, profiles!saved_diets_user_id_fkey(full_name)")
      .eq("subscription_active", true)
      .or(`subscription_next_order.is.null,subscription_next_order.lte.${now}`);

    if (error) {
      console.error("Error fetching diets:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let notified = 0;

    for (const diet of (diets || [])) {
      // Calculate next order date
      const interval = diet.subscription_interval === "weekly" ? 7 : 30;
      const nextOrder = new Date();
      nextOrder.setDate(nextOrder.getDate() + interval);

      // Update next order date
      await supabase
        .from("saved_diets")
        .update({ subscription_next_order: nextOrder.toISOString() })
        .eq("id", diet.id);

      // Get user email
      const { data: authUser } = await supabase.auth.admin.getUserById(diet.user_id);
      if (!authUser?.user?.email) continue;

      // Log notification (actual email sending would use Resend or similar)
      console.log(`Notification for ${authUser.user.email}: Diet "${diet.title}" subscription reminder`);
      notified++;
    }

    return new Response(JSON.stringify({ success: true, notified }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("diet-notifications error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
