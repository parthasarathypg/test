import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Crop Advisory Endpoint
app.post('/api/gemini/crop-advisory', async (req: Request, res: Response) => {
  try {
    const { crop, region, soilType, growthStage, issueDescription, weatherContext, language = 'English' } = req.body;

    const prompt = `You are an expert agronomist specializing in Indian agriculture and helping small and marginal farmers (<2 hectares) in India.
Current Farmer Context:
- Region / Agro-Climatic Zone: ${region || 'Central India'}
- Crop: ${crop || 'Paddy / Wheat'}
- Soil Type: ${soilType || 'Alluvial / Clay Loam'}
- Crop Growth Stage: ${growthStage || 'Vegetative to Flowering'}
- Farmer's Issue / Concern: ${issueDescription || 'Optimizing yield and managing climate stress'}
- Recent Weather: ${weatherContext || 'Erratic rainfall, high humidity'}
- Language requested: ${language}

Provide a practical, actionable, low-cost advisory formatted in clear sections:
1. Diagnosis & Root Cause
2. Immediate Action Plan (Low-cost organic / non-chemical remedies suitable for marginal farmer budgets)
3. Judicious Chemical Treatment (if necessary, specify exact chemical name, dilution in 15-liter knapsack sprayer, and safety precaution)
4. Climate-Smart Water & Irrigation Management
5. Government Scheme / KVK Support Tip (e.g., PM-Kisan, PMFBY, Soil Health Card, Subsidies)

Respond in clear, accessible, farmer-friendly ${language}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      advisory: response.text || 'Advisory could not be generated.',
    });
  } catch (error: any) {
    console.error('Error generating crop advisory:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate advisory',
    });
  }
});

// 2. Soil Health Card & Nutrition Plan Endpoint
app.post('/api/gemini/soil-prescription', async (req: Request, res: Response) => {
  try {
    const {
      crop,
      region,
      nitrogen,
      phosphorus,
      potassium,
      ph,
      organicCarbon,
      ec,
      zinc,
      language = 'English',
    } = req.body;

    const prompt = `You are a chief soil scientist with the Indian Council of Agricultural Research (ICAR).
Analyze this digital Soil Health Card for a smallholder farmer in ${region || 'India'} planting ${crop || 'Mixed Kharif crops'}:
- Available Nitrogen (N): ${nitrogen} kg/ha (Target standard: 280-560 kg/ha)
- Available Phosphorus (P2O5): ${phosphorus} kg/ha (Target standard: 23-56 kg/ha)
- Available Potassium (K2O): ${potassium} kg/ha (Target standard: 145-337 kg/ha)
- Soil pH: ${ph} (Ideal: 6.5 - 7.5)
- Organic Carbon (OC): ${organicCarbon}% (Ideal: >0.75%, Critical deficit if <0.5%)
- Electrical Conductivity (EC): ${ec} dS/m (Normal: <1.0 dS/m)
- Available Zinc (Zn): ${zinc} ppm (Deficient if <0.6 ppm)
- Language: ${language}

Many Indian farmers overdose on Urea (Nitrogen) causing soil acidification and disease susceptibility.
Provide a balanced, cost-effective nutrition schedule:
1. Soil Health Diagnostic Summary (Rating: Deficient / Optimal / Toxicity)
2. Precise Basal & Top-Dressing Fertilizer Schedule (in 50kg bags per acre for Urea, DAP, MOP, or SSP)
3. Regenerative & Organic Enhancements (e.g. Jeevamrut, vermicompost, Green manuring Dhaincha, Bio-NPK, Zinc Sulphate)
4. Remediation for pH / Low Organic Carbon
5. Expected Cost Savings vs Traditional Over-fertilization

Respond in warm, encouraging, practical ${language}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      prescription: response.text || 'Soil prescription could not be generated.',
    });
  } catch (error: any) {
    console.error('Error generating soil prescription:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate soil prescription',
    });
  }
});

// 3. Cross-State Climate Adaptation Blueprint Endpoint
app.post('/api/gemini/cross-state-blueprint', async (req: Request, res: Response) => {
  try {
    const {
      sourceState,
      targetState,
      climateThreat,
      cropCategory,
      agroClimaticDetails,
      language = 'English',
    } = req.body;

    const prompt = `You are the Coordinator for India's Inter-State Climate-Resilient Agriculture Initiative (NICRA).
The user is facilitating cross-state knowledge and practice sharing to help marginal farmers build climate resilience.
- Target State / Recipient Farmers: ${targetState}
- Donor / Best-Practice State: ${sourceState}
- Primary Climate Threat: ${climateThreat} (e.g., Monsoon Delay, Groundwater Depletion, Flash Floods, Extreme Heatwave, Salinity)
- Crop Type: ${cropCategory}
- Agro-climatic Context: ${agroClimaticDetails || 'Semi-arid / Alluvial marginal farmland'}
- Language: ${language}

Generate a comprehensive Cross-State Adaptation Blueprint:
1. The Transferred Practice / Technology (e.g., Direct Seeded Rice, Broad Bed Furrow, Swarna-Sub1 flood rice, Millets intercropping, Farm Pond Micro-irrigation)
2. Why it succeeded in ${sourceState} and how it addresses ${climateThreat}
3. Step-by-Step Adaptation Protocol for small farmers in ${targetState}
4. Economic Viability & Input Cost Comparison (Seed cost, diesel/irrigation savings, expected yield stabilization)
5. Practical Risks & What to Avoid during cross-state crop or technique adoption

Respond thoroughly in ${language}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({
      success: true,
      blueprint: response.text || 'Blueprint could not be generated.',
    });
  } catch (error: any) {
    console.error('Error generating cross-state blueprint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate blueprint',
    });
  }
});

// 4. Multimodal / Image Pest & Disease Diagnostic
app.post('/api/gemini/diagnose-crop', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', crop, symptoms, location, language = 'English' } = req.body;

    let contents: any;
    const textPrompt = `You are a plant pathologist diagnosing a crop disease or pest issue for a small Indian farmer.
Crop: ${crop || 'Crop specimen'}
Reported Symptoms: ${symptoms || 'Visual inspection requested'}
Location: ${location || 'India'}
Language: ${language}

Diagnose the issue accurately:
1. Disease / Pest Name (Common name in English + Hindi / local name + scientific name)
2. Confidence & Severity Level (Mild, Moderate, Severe)
3. Immediate Biological / Organic Control (low cost, easily available locally like neem extract, buttermilk, pheromone traps)
4. Safe Chemical Fungicide / Insecticide option with dosage per 15L water pump
5. Preventive Measures for Next Season

Provide clear, empowering advice in ${language}.`;

    if (imageBase64) {
      // Strip data url prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents = {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          { text: textPrompt },
        ],
      };
    } else {
      contents = textPrompt;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
    });

    res.json({
      success: true,
      diagnosis: response.text || 'Diagnosis completed.',
    });
  } catch (error: any) {
    console.error('Error in crop diagnostic:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Diagnosis failed',
    });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`KisanSetu full-stack agricultural server running on port ${port}`);
});
