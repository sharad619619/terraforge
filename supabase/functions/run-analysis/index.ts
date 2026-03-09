import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Seeded random for deterministic results based on input
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dataset_id, target_mineral, file_paths } = await req.json();

    if (!dataset_id || !target_mineral) {
      return new Response(JSON.stringify({ error: "Missing dataset_id or target_mineral" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create analysis run
    const { data: run, error: runErr } = await supabase
      .from("analysis_runs")
      .insert({ dataset_id, target_mineral, status: "processing" })
      .select()
      .single();

    if (runErr) throw runErr;

    // Generate simulated analysis results
    const seed = hashStr(`${dataset_id}-${target_mineral}`);
    const rand = seededRandom(seed);

    // Base center around India
    const baseLat = 20 + rand() * 8;
    const baseLng = 78 + rand() * 8;
    const zoneCount = 6 + Math.floor(rand() * 5);

    const zones = [];
    const geojsonFeatures = [];

    for (let i = 0; i < zoneCount; i++) {
      const terrain = 0.15 + rand() * 0.25;
      const spectral = 0.1 + rand() * 0.2;
      const geology = 0.15 + rand() * 0.25;
      const historical = 1 - terrain - spectral - geology;

      const probability =
        terrain * 0.35 +
        spectral * 0.2 +
        geology * 0.25 +
        historical * 0.2 +
        (rand() - 0.3) * 0.3;

      const prob = Math.max(0.1, Math.min(0.98, probability + 0.3));
      const classification = prob >= 0.75 ? "High" : prob >= 0.4 ? "Medium" : "Low";

      const cLat = baseLat + (rand() - 0.5) * 3;
      const cLng = baseLng + (rand() - 0.5) * 3;
      const size = 0.1 + rand() * 0.15;
      const sides = 5 + Math.floor(rand() * 3);
      const coords: [number, number][] = [];

      for (let j = 0; j <= sides; j++) {
        const angle = (j / sides) * Math.PI * 2;
        const r = size * (0.7 + rand() * 0.3);
        coords.push([cLng + Math.cos(angle) * r, cLat + Math.sin(angle) * r]);
      }

      const zoneId = `Z-${String.fromCharCode(65 + i)}${Math.floor(rand() * 90 + 10)}`;

      const zoneData = {
        zone_id: zoneId,
        probability: Math.round(prob * 1000) / 1000,
        classification,
        factors: {
          terrain: Math.round(terrain * 100) / 100,
          spectral: Math.round(spectral * 100) / 100,
          geology: Math.round(geology * 100) / 100,
          historical: Math.round(Math.max(historical, 0.05) * 100) / 100,
        },
      };

      zones.push(zoneData);

      // Save to DB
      await supabase.from("prediction_zones").insert({
        analysis_run_id: run.id,
        zone_id: zoneId,
        probability: prob,
        classification,
        factors: zoneData.factors,
        geojson: { type: "Polygon", coordinates: [coords] },
      });

      geojsonFeatures.push({
        type: "Feature",
        properties: { ...zoneData, target_mineral },
        geometry: { type: "Polygon", coordinates: [coords] },
      });
    }

    const geojson = { type: "FeatureCollection", features: geojsonFeatures };

    // Update analysis run with results
    await supabase
      .from("analysis_runs")
      .update({
        status: "completed",
        result: { region: "Analyzed Region", target_mineral, zones },
      })
      .eq("id", run.id);

    const responseData = {
      region: "Analyzed Region",
      target_mineral,
      zones: zones.sort((a, b) => b.probability - a.probability),
      geojson,
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
