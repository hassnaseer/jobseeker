import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, Star, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing } from '@/theme/spacing';
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
import { listReviewsReceivedBy } from '@/api/reviews';
import { uploadAvatar } from '@/api/users';
import { extractErrorMessage } from '@/api/client';
import type {
  CertificationItem,
  ClientProfile,
  MyProfile,
  SeekerProfile,
  WorkHistoryItem,
} from '@/types/profile';
import type { Review } from '@/types/domain';

function StarRow({ rating }: { rating: number }) {
  const { theme } = useTheme();
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} color={theme.warning} fill={n <= rating ? theme.warning : 'transparent'} />
      ))}
    </View>
  );
}

function WorkHistoryEditor({
  items,
  onChange,
}: {
  items: WorkHistoryItem[];
  onChange: (items: WorkHistoryItem[]) => void;
}) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function handleAdd() {
    if (!company.trim() || !title.trim()) return;
    onChange([...items, { company: company.trim(), title: title.trim(), startDate, endDate: endDate || undefined }]);
    setCompany('');
    setTitle('');
    setStartDate('');
    setEndDate('');
  }

  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={[styles.listItem, { borderColor: theme.border }]}>
          <View style={styles.listItemText}>
            <Text style={[styles.listItemTitle, { color: theme.text }]}>
              {item.title} · {item.company}
            </Text>
            <Text style={[styles.listItemMeta, { color: theme.textSecondary }]}>
              {item.startDate}
              {item.endDate ? ` – ${item.endDate}` : item.isCurrent ? ` – ${t('profile', 'present')}` : ''}
            </Text>
          </View>
          <Pressable
            onPress={() => onChange(items.filter((_, idx) => idx !== i))}
            style={styles.deleteIconButton}
            hitSlop={8}
          >
            <Trash2 size={16} color={theme.error} />
          </Pressable>
        </View>
      ))}
      <TextField label={t('profile', 'company')} value={company} onChangeText={setCompany} />
      <TextField label={t('profile', 'jobTitle')} value={title} onChangeText={setTitle} />
      <TextField label={t('profile', 'startDate')} value={startDate} onChangeText={setStartDate} placeholder="2022" />
      <TextField label={t('profile', 'endDate')} value={endDate} onChangeText={setEndDate} placeholder="2024" />
      <Button title={t('profile', 'addExperience')} variant="secondary" onPress={handleAdd} style={styles.addButton} />
    </View>
  );
}

function CertificationsEditor({
  items,
  onChange,
}: {
  items: CertificationItem[];
  onChange: (items: CertificationItem[]) => void;
}) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');

  function handleAdd() {
    if (!name.trim() || !issuer.trim()) return;
    onChange([...items, { name: name.trim(), issuer: issuer.trim() }]);
    setName('');
    setIssuer('');
  }

  return (
    <View>
      <View style={styles.chipRow}>
        {items.map((item, i) => (
          <View key={i} style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
            <Text style={{ color: theme.text }}>
              {item.name} · {item.issuer}
            </Text>
            <Text
              onPress={() => onChange(items.filter((_, idx) => idx !== i))}
              style={{ color: theme.error, marginLeft: spacing.xs, fontWeight: typography.weights.bold }}
            >
              ×
            </Text>
          </View>
        ))}
      </View>
      <TextField label={t('profile', 'certName')} value={name} onChangeText={setName} />
      <TextField label={t('profile', 'certIssuer')} value={issuer} onChangeText={setIssuer} />
      <Button title={t('profile', 'addCertification')} variant="secondary" onPress={handleAdd} style={styles.addButton} />
    </View>
  );
}

export function EditProfileScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);
  const isClient = user?.activeRole === 'CLIENT';

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

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
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [ratingSummary, setRatingSummary] = useState<{ avgRating: number; totalReviews: number; totalJobs: number } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

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
          setWorkHistory(sp?.workHistory ?? []);
          setCertifications(sp?.certifications ?? []);
          if (sp) {
            setRatingSummary({ avgRating: sp.avgRating, totalReviews: sp.totalReviews, totalJobs: sp.totalJobs });
          }
        }
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isClient]);

  useEffect(() => {
    if (user) {
      listReviewsReceivedBy(user.id)
        .then(setReviews)
        .catch(() => undefined);
    }
  }, [user]);

  async function handlePickAvatar() {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    setUploadingAvatar(true);
    setAvatarError(null);
    try {
      const { avatarUrl } = await uploadAvatar({
        uri: asset.uri,
        type: asset.type ?? 'image/jpeg',
        name: asset.fileName ?? 'avatar.jpg',
      });
      patchUser({ avatarUrl });
    } catch (err) {
      setAvatarError(extractErrorMessage(err));
    } finally {
      setUploadingAvatar(false);
    }
  }

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
          workHistory,
          certifications,
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

          <View style={styles.avatarRow}>
            <Pressable onPress={handlePickAvatar} disabled={uploadingAvatar}>
              <View style={[styles.avatarCircle, { backgroundColor: theme.selectedChipBg, borderColor: theme.border }]}>
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={[styles.avatarInitial, { color: theme.primary }]}>{firstName[0] ?? '?'}</Text>
                )}
                <View style={[styles.avatarBadge, { backgroundColor: theme.primary }]}>
                  {uploadingAvatar ? (
                    <ActivityIndicator size="small" color={theme.white} />
                  ) : (
                    <Camera size={14} color={theme.white} />
                  )}
                </View>
              </View>
            </Pressable>
            <View style={styles.avatarText}>
              <Text style={[styles.avatarLabel, { color: theme.text }]}>{t('profile', 'changePhoto')}</Text>
              <Text style={[styles.avatarHint, { color: theme.textSecondary }]}>{t('profile', 'photoHint')}</Text>
            </View>
          </View>
          {avatarError ? <Text style={[styles.errorText, { color: theme.error }]}>{avatarError}</Text> : null}

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

              {ratingSummary ? (
                <View style={[styles.ratingCard, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
                  <StarRow rating={Math.round(ratingSummary.avgRating)} />
                  <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                    {ratingSummary.avgRating.toFixed(1)} · {ratingSummary.totalJobs} {t('profile', 'jobsCompleted')} ·{' '}
                    {ratingSummary.totalReviews} {t('profile', 'reviewsCount')}
                  </Text>
                </View>
              ) : null}

              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile', 'workExperience')}</Text>
              <WorkHistoryEditor items={workHistory} onChange={setWorkHistory} />

              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile', 'certifications')}</Text>
              <CertificationsEditor items={certifications} onChange={setCertifications} />
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

          {!isClient && reviews.length > 0 ? (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('reviews', 'title')} ({reviews.length})</Text>
              {reviews.map((r) => (
                <View key={r.id} style={[styles.reviewCard, { borderColor: theme.border, backgroundColor: theme.cardBg }]}>
                  <StarRow rating={r.rating} />
                  <Text style={[styles.reviewComment, { color: theme.text }]}>{r.comment}</Text>
                  <Text style={[styles.reviewDate, { color: theme.textMuted }]}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </>
          ) : null}
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
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  avatarImage: { width: 64, height: 64, borderRadius: radius.full },
  avatarInitial: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { flex: 1 },
  avatarLabel: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  avatarHint: { fontSize: typography.sizes.xs, marginTop: 2 },
  sectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, marginBottom: spacing.sm, marginTop: spacing.md },
  textarea: { height: 100, textAlignVertical: 'top', paddingTop: spacing.sm },
  statusNote: { fontSize: typography.sizes.sm, marginTop: spacing.md },
  errorText: { marginTop: spacing.md },
  savedText: { marginTop: spacing.md },
  submit: { marginTop: spacing.lg },
  ratingCard: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm, marginBottom: spacing.sm },
  ratingText: { fontSize: typography.sizes.sm, marginTop: spacing.xs },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  listItemText: { flex: 1 },
  listItemTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  listItemMeta: { fontSize: typography.sizes.xs, marginTop: 2 },
  deleteIconButton: { height: 32, width: 32, alignItems: 'center', justifyContent: 'center' },
  addButton: { marginTop: spacing.sm, marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  reviewCard: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  reviewComment: { fontSize: typography.sizes.sm, marginTop: spacing.xs },
  reviewDate: { fontSize: typography.sizes.xs, marginTop: spacing.xs },
  starRow: { flexDirection: 'row', gap: 2 },
});
