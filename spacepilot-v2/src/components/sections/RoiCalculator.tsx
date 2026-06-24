'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Card, Label, Select } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { useMoney, useT } from '@/store/prefs';
import { computeRoi, estimateProject } from '@/lib/engine';
import type { Band } from '@/lib/types';

export function RoiCalculator() {
  const t = useT();
  const money = useMoney();
  const router = useRouter();
  const [sizeSqm, setSizeSqm] = useState(35);
  const [rate, setRate] = useState(160);
  const [occ, setOcc] = useState(68);
  const [band, setBand] = useState<Band>('standard');

  const result = useMemo(() => {
    const est = estimateProject({ band, roomType: 'studio', sizeSqm });
    const roi = computeRoi({ nightlyRateUsd: rate, occupancyPct: occ, band, projectMidUsd: est.mid });
    return { est, roi };
  }, [sizeSqm, rate, occ, band]);

  return (
    <Card className="overflow-hidden p-0 shadow-glow">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3.5">
        <div className="flex items-center gap-2 text-sm font-bold"><TrendingUp className="h-4 w-4 text-primary" /> {t('roi.title')}</div>
        <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent">scenario</span>
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <div className="space-y-4">
          <Range label={`${t('roi.size')} · ${sizeSqm} m²`} min={12} max={120} value={sizeSqm} onChange={setSizeSqm} />
          <Range label={`${t('roi.rent')} · ${money(rate)}`} min={40} max={600} step={5} value={rate} onChange={setRate} />
          <Range label={`${t('roi.occupancy')} · ${occ}%`} min={20} max={95} value={occ} onChange={setOcc} />
          <div>
            <Label>{t('roi.subtitle').split('.')[0]}</Label>
            <Select value={band} onChange={(e) => setBand(e.target.value as Band)}>
              <option value="lean">Lean refresh (+6% ADR scenario)</option>
              <option value="standard">Standard upgrade (+11% ADR scenario)</option>
              <option value="premium">Premium (+18% ADR scenario)</option>
            </Select>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-primary/8 to-accent/8 p-5">
          <div className="space-y-3.5">
            <Stat label={t('roi.upliftLabel')} value={money(result.roi.monthlyUpliftUsd)} big />
            <div className="grid grid-cols-2 gap-3">
              <Stat label={t('roi.annualLabel')} value={money(result.roi.annualUpliftUsd)} />
              <Stat label={t('roi.paybackLabel')} value={`${result.roi.paybackMonths} ${t('roi.months')}`} />
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground">
              Est. project: <span className="font-semibold text-foreground">{money(result.est.low)} – {money(result.est.high)}</span>
            </div>
          </div>
          <Button className="mt-4 w-full" onClick={() => router.push('/audit')}>{t('roi.cta')} <ArrowRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <p className="border-t border-border px-5 py-3 text-[11px] leading-relaxed text-muted-foreground">{t('roi.disclaimer')}</p>
    </Card>
  );
}

function Range({ label, min, max, step = 1, value, onChange }: { label: string; min: number; max: number; step?: number; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary" />
    </div>
  );
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={big ? 'text-3xl font-extrabold text-primary' : 'text-lg font-extrabold'}>{value}</div>
    </div>
  );
}
