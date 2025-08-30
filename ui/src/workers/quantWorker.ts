import type { TpqSettings, QuantResult } from '../types';

type RunMsg = { type: 'RUN'; imageData: ImageData; settings: TpqSettings };
type DoneMsg = { type: 'DONE'; result: QuantResult };
type ErrMsg = { type: 'ERROR'; error: string };

const post = (m: DoneMsg | ErrMsg) => (postMessage as any)(m);

self.onmessage = async (e: MessageEvent<RunMsg>) => {
  try {
    const { imageData, settings } = e.data;
    // Dynamically load your legacy/ported logic
    const { quantize } = await import('../../handlers/quantize');
    const result: QuantResult = await quantize(imageData, settings);
    post({ type: 'DONE', result });
  } catch (err: any) {
    post({ type: 'ERROR', error: String(err?.message ?? err) });
  }
};
