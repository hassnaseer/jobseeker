import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { TextField } from '@/components/TextField';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import {
  getMyProfile,
  updateBasicInfo,
  upsertClientProfile,
  upsertSeekerProfile,
} from '@/api/profiles';
import { extractErrorMessage } from '@/api/client';
import type { ClientProfile, MyProfile, SeekerProfile } from '@/types/profile';

export function EditProfileScreen() {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isClient = user?.activeRole === 'CLIENT';

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [about, setAbout] = useState('');
  const [website, setWebsite] = useState('');

  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getMyProfile(isClient ? 'CLIENT' : 'SEEKER')
      .then((data) => {
        setProfile(data);
        setFirstName(data.basic.firstName ?? '');
        setLastName(data.basic.lastName ?? '');
        setPhone(data.basic.phone ?? '');
        setCountry(data.basic.country ?? '');
        setCity(data.basic.city ?? '');
        if (isClient) {
          const cp = data.roleProfile as ClientProfile | null;
          setCompanyName(cp?.companyName ?? '');
          setAbout(cp?.about ?? '');
          setWebsite(cp?.website ?? '');
        } else {
          const sp = data.roleProfile as SeekerProfile | null;
          setTitle(sp?.title ?? '');
          setBio(sp?.bio ?? '');
          setSkills((sp?.skills ?? []).join(', '));
          setHourlyRate(sp?.hourlyRate ? String(sp.hourlyRate) : '');
        }
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isClient]);

  async function handleSave() {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      await updateBasicInfo({ firstName, lastName, phone, country, city });
      if (isClient) {
        await upsertClientProfile({ companyName, about, website });
      } else {
        await upsertSeekerProfile({
          title,
          bio,
          skills: skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        });
      }
      setSaved(true);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: theme.page }]}>
        <ActivityIndicator color={theme.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.page }]} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Edit profile</Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic info</Text>
          <TextField label="First name" value={firstName} onChangeText={setFirstName} />
          <TextField label="Last name" value={lastName} onChangeText={setLastName} />
          <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextField label="Country" value={country} onChangeText={(v) => setCountry(v.toUpperCase().slice(0, 2))} placeholder="US" />
          <TextField label="City" value={city} onChangeText={setCity} />

          {isClient ? (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Company</Text>
              <TextField label="Company name" value={companyName} onChangeText={setCompanyName} />
              <TextField label="Website" value={website} onChangeText={setWebsite} autoCapitalize="none" />
              <TextField label="About" value={about} onChangeText={setAbout} multiline numberOfLines={4} style={styles.textarea} />
            </>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Freelancer profile</Text>
              <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Full-stack developer" />
              <TextField label="Bio" value={bio} onChangeText={setBio} multiline numberOfLines={4} style={styles.textarea} />
              <TextField label="Skills (comma-separated)" value={skills} onChangeText={setSkills} placeholder="React, Node.js, SQL" />
              <TextField label="Hourly rate" value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" />
            </>
          )}

          {profile?.roleStatus ? (
            <Text style={[styles.statusNote, { color: theme.textMuted }]}>
              Profile status: {profile.roleStatus.profileStatus}
            </Text>
          ) : null}

          {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}
          {saved ? <Text style={[styles.savedText, { color: theme.success }]}>Saved</Text> : null}

          <Button title="Save changes" onPress={handleSave} loading={saving} style={styles.submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, marginBottom: spacing.lg },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, marginBottom: spacing.sm, marginTop: spacing.md },
  textarea: { height: 100, textAlignVertical: 'top', paddingTop: spacing.sm },
  statusNote: { fontSize: typography.sizes.sm, marginTop: spacing.md },
  errorText: { marginTop: spacing.md },
  savedText: { marginTop: spacing.md },
  submit: { marginTop: spacing.lg },
});
