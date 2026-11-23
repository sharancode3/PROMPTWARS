import { Resource, CapabilityTag } from 'shared';

export interface AIMatchResult {
  success: boolean;
  source: 'gemini' | 'rules';
  matchedCapabilities: CapabilityTag[];
  suggestedResourceId?: string;
  draftRequest: {
    title: string;
    justification: string;
    durationMinutes: number;
  };
  reasoning: string;
}

/**
 * Deterministic rule-based heuristic matcher when Gemini API is unavailable or offline.
 */
export function heuristicMatch(prompt: string, catalog: Resource[]): AIMatchResult {
  const p = prompt.toLowerCase();
  const matchedCaps = new Set<CapabilityTag>();

  // Keyword to capability mappings
  if (p.includes('gpu') || p.includes('deep learning') || p.includes('cuda') || p.includes('train')) {
    matchedCaps.add('gpu-compute');
    matchedCaps.add('cuda-training');
  }
  if (p.includes('llm') || p.includes('inference') || p.includes('gpt')) {
    matchedCaps.add('llm-inference');
    matchedCaps.add('gpu-compute');
  }
  if (p.includes('drone') || p.includes('robot') || p.includes('edge') || p.includes('yolo') || p.includes('orin') || p.includes('jetson')) {
    matchedCaps.add('edge-ai');
    matchedCaps.add('iot-prototyping');
  }
  if (p.includes('fpga') || p.includes('verilog') || p.includes('vhdl') || p.includes('zynq')) {
    matchedCaps.add('fpga-synthesis');
  }
  if (p.includes('logic') || p.includes('timing') || p.includes('skew')) {
    matchedCaps.add('logic-analyzer');
    matchedCaps.add('signal-measurement');
  }
  if (p.includes('scope') || p.includes('oscilloscope') || p.includes('waveform') || p.includes('signal')) {
    matchedCaps.add('oscilloscope-high-speed');
    matchedCaps.add('signal-measurement');
  }
  if (p.includes('3d') || p.includes('print') || p.includes('resin') || p.includes('sla')) {
    matchedCaps.add('3d-printing-sla');
  }
  if (p.includes('cnc') || p.includes('mill') || p.includes('machin')) {
    matchedCaps.add('cnc-milling');
  }
  if (p.includes('rf') || p.includes('antenna') || p.includes('spectrum') || p.includes('ghz') || p.includes('radio')) {
    matchedCaps.add('spectrum-analysis');
    matchedCaps.add('rf-microwave');
  }
  if (p.includes('thermal') || p.includes('heat') || p.includes('temperature') || p.includes('flir')) {
    matchedCaps.add('thermal-imaging');
  }

  // If no specific match, default to general signal measurement
  if (matchedCaps.size === 0) {
    matchedCaps.add('signal-measurement');
  }

  const capsList = Array.from(matchedCaps);

  // Score resources in catalog by matching capability tags
  let bestResource: Resource | undefined;
  let bestScore = -1;

  for (const res of catalog) {
    const score = capsList.filter((c) => res.capabilityTags.includes(c)).length;
    if (score > bestScore && res.status === 'available') {
      bestScore = score;
      bestResource = res;
    }
  }

  if (!bestResource && catalog.length > 0) {
    bestResource = catalog[0];
  }

  // Generate clean draft title from prompt
  const words = prompt.trim().split(/\s+/).slice(0, 6).join(' ');
  const title = words.length > 4 ? `${words.charAt(0).toUpperCase() + words.slice(1)} Project` : 'Hardware Access Project';

  return {
    success: true,
    source: 'rules',
    matchedCapabilities: capsList,
    suggestedResourceId: bestResource?.id,
    draftRequest: {
      title,
      justification: `Automated match for: "${prompt.slice(0, 150)}..." Target hardware: ${bestResource?.name || 'Lab Workstation'}.`,
      durationMinutes: bestResource?.maxSessionMinutes ? Math.min(120, bestResource.maxSessionMinutes) : 120
    },
    reasoning: `Matched ${capsList.length} required technical capabilities (${capsList.join(', ')}) to ${bestResource?.name}.`
  };
}

/**
 * Parses natural language project intake via Google GenAI or transparent heuristic fallback.
 */
export async function interpretProjectNeed(
  prompt: string,
  catalog: Resource[],
  timeoutMs: number = 5000
): Promise<AIMatchResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return heuristicMatch(prompt, catalog);
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    // Build minimal catalog summary for model
    const catalogSummary = catalog.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      capabilities: r.capabilityTags
    }));

    const systemPrompt = `You are the LabLink Equipment Advisor.
Analyze the user's laboratory project description and map it to the most relevant hardware in this catalog:
${JSON.stringify(catalogSummary)}

Return ONLY valid JSON matching this structure:
{
  "matchedCapabilities": ["capability-tag-1"],
  "suggestedResourceId": "resource-id",
  "title": "Clean Project Title",
  "justification": "Why this equipment is needed",
  "reasoning": "Technical explanation"
}`;

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI timeout')), timeoutMs)
    );

    const apiPromise = ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Project Need: "${prompt.slice(0, 500)}"` }] }
      ]
    });

    const response = (await Promise.race([apiPromise, timeoutPromise])) as { text?: string };
    const responseText = response.text || '';
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return heuristicMatch(prompt, catalog);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate suggested resource exists in catalog
    const verifiedResource = catalog.find((r) => r.id === parsed.suggestedResourceId) || catalog[0];

    return {
      success: true,
      source: 'gemini',
      matchedCapabilities: Array.isArray(parsed.matchedCapabilities) ? parsed.matchedCapabilities : verifiedResource.capabilityTags,
      suggestedResourceId: verifiedResource?.id,
      draftRequest: {
        title: String(parsed.title || 'Specialized Lab Project'),
        justification: String(parsed.justification || prompt),
        durationMinutes: 120
      },
      reasoning: String(parsed.reasoning || `Matched to ${verifiedResource?.name}`)
    };
  } catch (_err) {
    // Graceful offline fallback on timeout, error, or invalid key
    return heuristicMatch(prompt, catalog);
  }
}
