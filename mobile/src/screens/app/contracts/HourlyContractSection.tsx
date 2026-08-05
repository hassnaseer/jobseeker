import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useContractsStore } from '@/store/contractsStore';
import { useTimesheetsStore } from '@/store/timesheetsStore';
import { extractErrorMessage } from '@/api/client';
import type { Contract, TimesheetPeriodStatus } from '@/types/domain';

const PERIOD_TONE: Record<TimesheetPeriodStatus, 'neutral' | 'success' | 'warning' | 'error' | 'info'> = {
  OPEN: 'neutral',
  CLOSED: 'warning',
  APPROVED: 'success',
  DISPUTED: 'error',
};

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

interface Props {
  contract: Contract;
  isOwner: boolean;
  isSeeker: boolean;
}

export function HourlyContractSection({ contract, isOwner, isSeeker }: Props) {
  const { theme } = useTheme();
  const { activateHourly, completeHourly } = useContractsStore();
  const { entries, periods, activeEntry, fetch, logManual, startTimer, stopTimer, closePeriod } = useTimesheetsStore();

  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetch(contract.id).catch(() => undefined);
  }, [contract.id, fetch]);

  useEffect(() => {
    if (!activeEntry) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  async function run(key: string, action: () => Promise<void>) {
    setError(null);
    setBusy(key);
    try {
      await action();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleLogTime() {
    if (!hours || !description.trim()) return;
    await run('log', () => logManual(contract.id, { hours: Number(hours), description: description.trim() }));
    setHours('');
    setDescription('');
  }

  const elapsedMs = activeEntry?.startTime ? now - new Date(activeEntry.startTime).getTime() : 0;
  const usesTimer = contract.trackingMode === 'TIMER' || contract.trackingMode === 'TIMER_WITH_SCREENSHOTS';

  return (
    <View>
      {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

      {contract.status === 'PENDING_FUNDING' && isOwner ? (
        <Button
          title="Activate contract"
          onPress={() => run('activate', () => activateHourly(contract.id))}
          loading={busy === 'activate'}
          style={styles.section}
        />
      ) : null}

      {contract.status === 'ACTIVE' && isSeeker ? (
        <View style={[styles.card, styles.section, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
          {usesTimer ? (
            <View style={styles.timerRow}>
              <Text style={[styles.timerText, { color: theme.text }]}>{formatElapsed(elapsedMs)}</Text>
              {activeEntry ? (
                <Button title="Stop" variant="secondary" onPress={() => run('timer', () => stopTimer(contract.id))} loading={busy === 'timer'} />
              ) : (
                <Button title="Start timer" onPress={() => run('timer', () => startTimer(contract.id))} loading={busy === 'timer'} />
              )}
            </View>
          ) : null}

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Log time manually</Text>
          <View style={styles.row}>
            <TextField
              value={hours}
              onChangeText={setHours}
              keyboardType="numeric"
              placeholder="Hours"
              style={styles.hoursInput}
            />
            <TextField value={description} onChangeText={setDescription} placeholder="What did you work on?" style={styles.descInput} />
          </View>
          <Button title="Log time" onPress={handleLogTime} loading={busy === 'log'} disabled={!hours || !description.trim()} />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Timesheet periods</Text>
        {periods.length === 0 ? <Text style={[styles.empty, { color: theme.textMuted }]}>No periods yet.</Text> : null}
        {periods.map((p) => (
          <View key={p.id} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {new Date(p.periodStart).toLocaleDateString()} – {new Date(p.periodEnd).toLocaleDateString()}
              </Text>
              <Badge label={p.status} tone={PERIOD_TONE[p.status]} />
            </View>
            <Text style={[styles.cardBody, { color: theme.textSecondary }]}>
              {p.totalHours}h · {p.currency} {p.totalAmount}
            </Text>
            {p.status === 'OPEN' && isSeeker ? (
              <Button title="Close period" variant="ghost" onPress={() => run(p.id, () => closePeriod(contract.id, p.id))} loading={busy === p.id} style={styles.actionButton} />
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Time entries</Text>
        {entries.map((entry) => (
          <View key={entry.id} style={[styles.entryRow, { borderColor: theme.border }]}>
            <Text style={[styles.entryText, { color: theme.text }]}>
              {entry.hours ? `${entry.hours}h` : '—'} {entry.description ? `— ${entry.description}` : ''}
            </Text>
            <Badge label={entry.status} tone={entry.status === 'APPROVED' ? 'success' : entry.status === 'DISPUTED' ? 'error' : 'neutral'} />
          </View>
        ))}
      </View>

      {contract.status === 'ACTIVE' && isOwner ? (
        <Button title="Complete contract" variant="ghost" onPress={() => run('complete', () => completeHourly(contract.id))} loading={busy === 'complete'} style={styles.section} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, marginBottom: spacing.sm },
  empty: { fontSize: typography.sizes.sm },
  errorText: { marginBottom: spacing.md },
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  cardTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  cardBody: { fontSize: typography.sizes.sm, marginBottom: spacing.sm },
  actionButton: { marginTop: spacing.xs },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  timerText: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', gap: spacing.sm },
  hoursInput: { width: 90 },
  descInput: { flex: 1 },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: spacing.sm,
  },
  entryText: { fontSize: typography.sizes.sm, flex: 1, marginRight: spacing.sm },
});
