import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import type { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { useJobsStore } from '@/store/jobsStore';
import { extractErrorMessage } from '@/api/client';
import { getCategoryTree, flattenCategoryTree } from '@/api/categories';
import type { JobsStackParamList } from '@/navigation/types';
import type { CreateJobInput } from '@/api/jobs';

type Props = StackScreenProps<JobsStackParamList, 'PostJob'>;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

export function PostJobScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const createJob = useJobsStore((s) => s.create);
  const publish = useJobsStore((s) => s.publish);

  const [categories, setCategories] = useState<{ id: string; label: string }[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [jobType, setJobType] = useState<'FIXED' | 'HOURLY'>('FIXED');
  const [locationType, setLocationType] = useState<'REMOTE' | 'PHYSICAL'>('REMOTE');
  const [experienceLevel, setExperienceLevel] = useState('INTERMEDIATE');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [hourlyRateMin, setHourlyRateMin] = useState('');
  const [hourlyRateMax, setHourlyRateMax] = useState('');
  const [numberOfOpenings, setNumberOfOpenings] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<'draft' | 'publish' | null>(null);

  useEffect(() => {
    getCategoryTree()
      .then((tree) => setCategories(flattenCategoryTree(tree)))
      .catch(() => undefined);
  }, []);

  function buildInput(): CreateJobInput {
    return {
      title: title.trim(),
      description: description.trim(),
      categoryId,
      jobType,
      locationType,
      experienceLevel,
      numberOfOpenings: Number(numberOfOpenings) || 1,
      budgetAmount: jobType === 'FIXED' && budgetAmount ? Number(budgetAmount) : undefined,
      hourlyRateMin: jobType === 'HOURLY' && hourlyRateMin ? Number(hourlyRateMin) : undefined,
      hourlyRateMax: jobType === 'HOURLY' && hourlyRateMax ? Number(hourlyRateMax) : undefined,
      pricingModel: jobType === 'FIXED' ? 'LUMP' : undefined,
    };
  }

  async function handleSubmit(mode: 'draft' | 'publish') {
    setError(null);
    if (!title.trim() || !description.trim() || !categoryId) {
      setError('Title, description and category are required');
      return;
    }
    setSubmitting(mode);
    try {
      const job = await createJob(buildInput());
      if (mode === 'publish') {
        await publish(job.id);
      }
      navigation.replace('JobDetail', { jobId: job.id });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Post a job</Text>

          <Field label="Title">
            <TextField value={title} onChangeText={setTitle} placeholder="e.g. Build a landing page" />
          </Field>

          <Field label="Description">
            <TextField
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the work, deliverables and requirements"
              multiline
              numberOfLines={5}
              style={styles.textarea}
            />
          </Field>

          <Field label="Category">
            <View style={[styles.pickerWrap, { borderColor: theme.inputBorder, backgroundColor: theme.surface }]}>
              <Picker selectedValue={categoryId} onValueChange={setCategoryId} dropdownIconColor={theme.text}>
                <Picker.Item label="Select a category" value="" />
                {categories.map((c) => (
                  <Picker.Item key={c.id} label={c.label} value={c.id} />
                ))}
              </Picker>
            </View>
          </Field>

          <View style={styles.row}>
            <Field label="Pricing">
              <View style={[styles.pickerWrap, { borderColor: theme.inputBorder, backgroundColor: theme.surface }]}>
                <Picker selectedValue={jobType} onValueChange={(v) => setJobType(v as 'FIXED' | 'HOURLY')} dropdownIconColor={theme.text}>
                  <Picker.Item label="Fixed price" value="FIXED" />
                  <Picker.Item label="Hourly" value="HOURLY" />
                </Picker>
              </View>
            </Field>
            <Field label="Location">
              <View style={[styles.pickerWrap, { borderColor: theme.inputBorder, backgroundColor: theme.surface }]}>
                <Picker
                  selectedValue={locationType}
                  onValueChange={(v) => setLocationType(v as 'REMOTE' | 'PHYSICAL')}
                  dropdownIconColor={theme.text}
                >
                  <Picker.Item label="Remote" value="REMOTE" />
                  <Picker.Item label="On-site" value="PHYSICAL" />
                </Picker>
              </View>
            </Field>
          </View>

          {jobType === 'FIXED' ? (
            <Field label="Budget (USD)">
              <TextField value={budgetAmount} onChangeText={setBudgetAmount} keyboardType="numeric" placeholder="500" />
            </Field>
          ) : (
            <View style={styles.row}>
              <Field label="Min rate / hr">
                <TextField value={hourlyRateMin} onChangeText={setHourlyRateMin} keyboardType="numeric" placeholder="15" />
              </Field>
              <Field label="Max rate / hr">
                <TextField value={hourlyRateMax} onChangeText={setHourlyRateMax} keyboardType="numeric" placeholder="30" />
              </Field>
            </View>
          )}

          <View style={styles.row}>
            <Field label="Experience level">
              <View style={[styles.pickerWrap, { borderColor: theme.inputBorder, backgroundColor: theme.surface }]}>
                <Picker selectedValue={experienceLevel} onValueChange={setExperienceLevel} dropdownIconColor={theme.text}>
                  <Picker.Item label="Entry" value="ENTRY" />
                  <Picker.Item label="Intermediate" value="INTERMEDIATE" />
                  <Picker.Item label="Expert" value="EXPERT" />
                </Picker>
              </View>
            </Field>
            <Field label="Openings">
              <TextField value={numberOfOpenings} onChangeText={setNumberOfOpenings} keyboardType="numeric" />
            </Field>
          </View>

          {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

          <Button
            title="Publish job"
            onPress={() => handleSubmit('publish')}
            loading={submitting === 'publish'}
            disabled={submitting !== null}
            style={styles.submit}
          />
          <Button
            title="Save as draft"
            variant="secondary"
            onPress={() => handleSubmit('draft')}
            loading={submitting === 'draft'}
            disabled={submitting !== null}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.lg },
  field: { flex: 1, marginBottom: spacing.md },
  fieldLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, marginBottom: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.md },
  pickerWrap: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  textarea: { height: 120, textAlignVertical: 'top', paddingTop: spacing.sm },
  errorText: { marginBottom: spacing.md },
  submit: { marginTop: spacing.sm },
});
