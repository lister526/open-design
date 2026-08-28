'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Gauge } from 'lucide-react';
import { Card, Input, Select, Label } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { LeakMap, GradeBadge } from '@/components/ui/shared';
import { useMoney, useT } from '@/store/prefs';
import { computeRevenueLeakScore, estimateMonthlyUpside, recommendUpgradeKit } from '@/lib/engine';
import { PROPERTY_TYPES, PHOTO_QUALITIES, GOALS, labelOf } from '@/lib/options';
import type { ScanInput } from '@/lib/types';
import { cn } from '@/lib/cn';

const DEFAULT: ScanInput = {
  city: 'Osaka', country: '', propertyType: 'one_bed', adrUsd: 120, occupancyPct: 68,
  sizeSqm: 30, photoQuality: 'poor', goal: 'higher_adr',
};

export function Scanner() {
  const t = useT();
  const money = useMoney();
  const [i, setI] = useState<ScanInput>(DEFAULT);
  const [scanned, setScanned] = useState(false);
  const set = (p: Partial<ScanInput>) => setI((s) => ({ ...s, ...p }));

  const result = useMemo(() => {
    const leak = computeRevenueLeakScore(i);
    const kit = recommendUpgradeKit(i, leak, 'standard');
    const scenario = estimateMonthlyUpside(i, leak, 'standard', kit.projectMidUsd);
    return { leak, kit, scenario };
  }, [i]);

  return (
    <Card className="overflow-hidden p-0 shadow-raised">
      <div className="hairline-t flex items-center gap-2 border-b border-border bg-muted/40 px-5 py-3.5">
        <Gauge className="h-4 w-4 text-accent" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{t('scanner.title')}</p>
          <p className="truncate text-xs text-muted-foreground">{t('scanner.subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-0 sm:grid-cols-2">
        {/* inputs */}
        <div className="space-y-3.5 border-border p-5 sm:border-r">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{t('scanner.city')}</Label><Input value={i.city} onChange={(e) => set({ city: e.target.value })} placeholder="Osaka" /></div>
            <div><Label>{t('scanner.type')}</Label>
              <Select value={i.propertyType} onChange={(e) => set({ propertyType: e.target.value as ScanInput['propertyType'] })}>
                {PROPERTY_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </div>
          </div>
          <div><Label>{t('scanner.adr')} · {money(i.adrUsd)}</Label>
            <input type="range" min={30} max={600} step={5} value={i.adrUsd} onChange={(e) => set({ adrUsd: Number(e.target.value) })} className="h-2 w-full cursor-pointer rounded-full bg-muted accent-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{t('scanner.occupancy')} · {i.occupancyPct}%</Label>
              <input type="range" min={20} max={95} value={i.occupancyPct} onChange={(e) => set({ occupancyPct: Number(e.target.value) })} className="h-2 w-full cursor-pointer rounded-full bg-muted accent-accent" />
            </div>
            <div><Label>{t('scanner.size')} · {i.sizeSqm} m²</Label>
              <input type="range" min={10} max={140} value={i.sizeSqm} onChange={(e) => set({ sizeSqm: Number(e.target.value) })} className="h-2 w-full cursor-pointer rounded-full bg-muted accent-accent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>{t('scanner.photo')}</Label>
              <Select value={i.photoQuality} onChange={(e) => set({ photoQuality: e.target.value as ScanInput['photoQuality'] })}>
                {PHOTO_QUALITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </div>
            <div><Label>{t('scanner.goal')}</Label>
              <Select value={i.goal} onChange={(e) => set({ goal: e.target.value as ScanInput['goal'] })}>
                {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </Select>
            </div>
          </div>
          <Button className="w-full" onClick={() => setScanned(true)}>
            <Search className="h-4 w-4" /> {scanned ? t('scanner.rescan') : t('scanner.run')}
          </Button>
        </div>

        {/* output */}
        <div className={cn('relative p-5 transition', !scanned && 'pointer-events-none')}>
          {!scanned && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-card/70 backdrop-blur-[2px]">
              <p className="max-w-[14rem] text-center text-sm font-semibold text-muted-foreground">Adjust your listing, then run the scan to reveal the leak map.</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t('scanner.scoreLabel')}</p>
              <p className="font-display text-5xl font-semibold tabular-nums">{result.leak.score}<span className="text-lg text-muted-foreground">/100</span></p>
            </div>
            <GradeBadge grade={result.leak.grade} />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t('scanner.topLeaks')}</p>
            <LeakMap leaks={result.leak.topLeaks} compact />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Mini label={t('scanner.upside')} value={`${money(result.scenario.monthlyUpsideLowUsd)}–${money(result.scenario.monthlyUpsideHighUsd)}`} accent />
            <Mini label={t('scanner.payback')} value={`${result.scenario.paybackMonthsLow}–${result.scenario.paybackMonthsHigh} ${t('common.month')}`} />
          </div>
          <div className="mt-2.5 rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t('scanner.kit')}</p>
            <p className="mt-0.5 text-sm font-bold">{result.kit.name}</p>
            <p className="text-xs text-muted-foreground">{money(result.kit.projectLowUsd)}–{money(result.kit.projectHighUsd)} · {result.kit.items.length} components</p>
          </div>

          <Link href="/audit"><Button variant="accent" className="mt-3 w-full">{t('scanner.cta')} <ArrowRight className="h-4 w-4" /></Button></Link>
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/80">{t('scanner.disclaimer')}</p>
        </div>
      </div>
    </Card>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-xl border p-3', accent ? 'border-revenue/25 bg-revenue/5' : 'border-border bg-muted/30')}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn('mt-0.5 text-sm font-extrabold', accent && 'revenue-text')}>{value}</div>
    </div>
  );
}
