import { describe, it, expect } from 'vitest';
import { heuristicMatch, interpretProjectNeed } from '../src/services/aiMatcher.js';
import { createSeedScenario } from 'shared';

describe('AI Semantic Matcher & Rules Fallback', () => {
  const scenario = createSeedScenario();
  const catalog = scenario.resources;

  it('runs deterministic rule fallback when API key is missing or empty', async () => {
    // Delete API key from env for this test
    const oldKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const result = await interpretProjectNeed(
      'Need an FPGA board and a high speed logic analyzer for sub-nanosecond clock testing',
      catalog
    );

    expect(result.success).toBe(true);
    expect(result.source).toBe('rules');
    expect(result.matchedCapabilities).toContain('logic-analyzer');
    expect(result.matchedCapabilities).toContain('fpga-synthesis');
    expect(result.draftRequest.title).toBeDefined();
    expect(result.draftRequest.justification).toBeDefined();
    expect(result.reasoning).toBeDefined();

    process.env.GEMINI_API_KEY = oldKey;
  });

  it('maps drone edge AI requirements to Jetson AGX Orin dev kit', () => {
    const result = heuristicMatch(
      'Autonomous drone obstacle avoidance running real-time YOLOv8 with tensor cores',
      catalog
    );

    expect(result.source).toBe('rules');
    expect(result.matchedCapabilities).toContain('edge-ai');
    expect(result.suggestedResourceId).toBe('res_jetson_orin_01');
  });

  it('maps deep learning CUDA requirements to RTX 4090 GPU rig', () => {
    const result = heuristicMatch(
      'Fine-tuning a 7B LLM model with PyTorch and CUDA deep learning',
      catalog
    );

    expect(result.source).toBe('rules');
    expect(result.matchedCapabilities).toContain('gpu-compute');
    expect(result.suggestedResourceId).toBe('res_rtx4090_rig_01');
  });

  it('maps 3D printing requirements to SLA resin printer', () => {
    const result = heuristicMatch(
      'Rapid prototyping smooth plastic enclosure with 3D resin SLA print',
      catalog
    );

    expect(result.source).toBe('rules');
    expect(result.matchedCapabilities).toContain('3d-printing-sla');
    expect(result.suggestedResourceId).toBe('res_formlabs_3d_01');
  });
});
