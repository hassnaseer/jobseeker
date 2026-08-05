import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { createReview, editReview } from '@/api/reviews';
import { extractErrorMessage } from '@/api/client';
import type { Review } from '@/types/domain';

interface Props {
  visible: boolean;
  onClose: () => void;
  contractId: string;
  existing: Review | null;
  onSaved: (review: Review) => void;
}

export function ReviewModal({ visible, onClose, contractId, existing, onSaved }: Props) {
  const { theme } = useTheme();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setRating(existing?.rating ?? 0);
      setComment(existing?.comment ?? '');
      setError(null);
    }
  }, [visible, existing]);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const review = existing
        ? await editReview(existing.id, { rating, comment: comment.trim() })
        : await createReview(contractId, { rating, comment: comment.trim() });
      onSaved(review);
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.title, { color: theme.text }]}>{existing ? 'Edit review' : 'Leave a review'}</Text>
          {error ? <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text> : null}

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)} hitSlop={8}>
                <Star size={32} color={theme.warning} fill={n <= rating ? theme.warning : 'transparent'} />
              </Pressable>
            ))}
          </View>

          <TextField
            label="Comment"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            style={styles.commentInput}
          />

          <View style={styles.actionsRow}>
            <Button title="Cancel" variant="ghost" onPress={onClose} style={styles.actionButtonFlex} />
            <Button
              title="Submit"
              onPress={handleSubmit}
              loading={saving}
              disabled={rating < 1 || comment.trim().length < 3}
              style={styles.actionButtonFlex}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  card: { borderRadius: radius.lg, padding: spacing.lg },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  errorText: { marginBottom: spacing.sm },
  starsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  commentInput: { height: 90, textAlignVertical: 'top', paddingTop: spacing.sm },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionButtonFlex: { flex: 1 },
});
