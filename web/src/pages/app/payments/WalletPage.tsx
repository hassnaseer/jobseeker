import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DataTable, { type DataTableColumn } from '@/components/data/DataTable';
import StatusChip from '@/components/StatusChip';
import Modal from '@/components/feedback/Modal';
import FormTextField from '@/components/form/FormTextField';
import FormSelectField from '@/components/form/FormSelectField';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createPayoutMethod, fetchPaymentsOverview, requestWithdrawal } from '@/features/payments/actions';
import { extractErrorMessage } from '@/api/client';
import type { PayoutMethodType, Transaction, WithdrawalRequest } from '@/types/domain';

export default function WalletPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { wallets, transactions, payoutMethods, withdrawals, status } = useAppSelector((s) => s.payments);
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchPaymentsOverview());
  }, [dispatch]);

  const txColumns: DataTableColumn<Transaction>[] = [
    { key: 'type', header: 'Type', render: (tx) => tx.type.replace(/_/g, ' ') },
    { key: 'amount', header: t('contracts.amount'), render: (tx) => `${tx.currency} ${tx.amount}` },
    { key: 'status', header: t('catalogs.status'), render: (tx) => <StatusChip status={tx.status} /> },
    { key: 'date', header: t('jobs.posted'), render: (tx) => new Date(tx.createdAt).toLocaleDateString() },
  ];

  const wdColumns: DataTableColumn<WithdrawalRequest>[] = [
    { key: 'amount', header: t('payments.withdrawAmount'), render: (w) => `${w.currency} ${w.amount}` },
    { key: 'status', header: t('catalogs.status'), render: (w) => <StatusChip status={w.status} /> },
    { key: 'date', header: t('jobs.posted'), render: (w) => new Date(w.requestedAt).toLocaleDateString() },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('payments.title')}
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        {wallets.map((w) => (
          <Grid key={w.id} size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary">
                {t('payments.balance')} ({w.currency})
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {w.currency} {w.balance}
              </Typography>
              {w.pendingBalance > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {t('payments.pending')}: {w.currency} {w.pendingBalance}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
        {wallets.length === 0 && status !== 'loading' && (
          <Grid size={12}>
            <Paper sx={{ p: 2.5 }}>
              <Typography color="text.secondary">{t('payments.balance')}: USD 0</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('payments.payoutMethods')}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<AddIcon />} onClick={() => setAddMethodOpen(true)}>
            {t('payments.addPayoutMethod')}
          </Button>
          <Button size="small" variant="contained" onClick={() => setWithdrawOpen(true)} disabled={payoutMethods.length === 0}>
            {t('payments.withdraw')}
          </Button>
        </Stack>
      </Stack>
      {payoutMethods.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t('payments.noPayoutMethods')}
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mb: 3 }}>
          {payoutMethods.map((m) => (
            <Paper key={m.id} variant="outlined" sx={{ p: 1.5 }}>
              <Typography sx={{ fontWeight: 600 }}>
                {m.type === 'BANK' ? m.bankName || 'Bank account' : m.type.replace(/_/g, ' ')}
                {m.isDefault ? ' · default' : ''}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('payments.withdrawals')}
      </Typography>
      <Box sx={{ mb: 4 }}>
        <DataTable
          columns={wdColumns}
          rows={withdrawals}
          getRowKey={(w) => w.id}
          loading={status === 'loading'}
          emptyMessage={t('payments.noWithdrawals')}
        />
      </Box>

      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {t('payments.transactions')}
      </Typography>
      <DataTable
        columns={txColumns}
        rows={transactions}
        getRowKey={(tx) => tx.id}
        loading={status === 'loading'}
        emptyMessage={t('payments.noTransactions')}
      />

      <AddPayoutMethodModal open={addMethodOpen} onClose={() => setAddMethodOpen(false)} />
      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
    </Box>
  );
}

function AddPayoutMethodModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [type, setType] = useState<PayoutMethodType>('BANK');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftOrRouting, setSwiftOrRouting] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const typeOptions = [
    { value: 'BANK', label: t('payments.methodBank') },
    { value: 'WALLET', label: t('payments.methodWallet') },
    { value: 'STRIPE_CONNECT', label: t('payments.methodStripeConnect') },
  ];

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await dispatch(
        createPayoutMethod({
          type,
          bankName: type === 'BANK' ? bankName : undefined,
          accountHolder: type === 'BANK' ? accountHolder : undefined,
          accountNumber: type === 'BANK' ? accountNumber : undefined,
          swiftOrRouting: type === 'BANK' ? swiftOrRouting : undefined,
        }),
      );
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('payments.addPayoutMethod')}
      actions={
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {t('common.save')}
        </Button>
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <FormSelectField
          label={t('payments.methodType')}
          value={type}
          onChange={(v) => setType(v as PayoutMethodType)}
          options={typeOptions}
          allowEmpty={false}
        />
        {type === 'BANK' && (
          <>
            <FormTextField label={t('payments.bankName')} value={bankName} onChange={setBankName} />
            <FormTextField label={t('payments.accountHolder')} value={accountHolder} onChange={setAccountHolder} />
            <FormTextField label={t('payments.accountNumber')} value={accountNumber} onChange={setAccountNumber} />
            <FormTextField label={t('payments.swiftOrRouting')} value={swiftOrRouting} onChange={setSwiftOrRouting} />
          </>
        )}
      </Stack>
    </Modal>
  );
}

function WithdrawModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { wallets, payoutMethods } = useAppSelector((s) => s.payments);
  const [amount, setAmount] = useState('');
  const [payoutMethodId, setPayoutMethodId] = useState(payoutMethods[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currency = wallets[0]?.currency ?? 'USD';
  const methodOptions = payoutMethods.map((m) => ({
    value: m.id,
    label: m.type === 'BANK' ? m.bankName || 'Bank account' : m.type.replace(/_/g, ' '),
  }));

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await dispatch(requestWithdrawal({ amount: Number(amount), currency, payoutMethodId }));
      setAmount('');
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('payments.withdraw')}
      actions={
        <Button variant="contained" onClick={handleSubmit} disabled={saving || !amount || !payoutMethodId}>
          {t('payments.withdraw')}
        </Button>
      }
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <FormTextField label={t('payments.withdrawAmount')} type="number" value={amount} onChange={setAmount} />
        <FormSelectField
          label={t('payments.payoutMethods')}
          value={payoutMethodId}
          onChange={setPayoutMethodId}
          options={methodOptions}
          allowEmpty={false}
        />
      </Stack>
    </Modal>
  );
}
