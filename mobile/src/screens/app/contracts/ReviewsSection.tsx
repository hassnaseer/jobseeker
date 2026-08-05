import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Button } from '@/components/Button';
import { listReviewsForContract } from '@/api/reviews';
import type { Contract, Review } from '@/types/domain';
import { ReviewModal } from './ReviewModal';

interface Props {
  contract: Contract;
  currentUserId: string;
}

function StarRow({ rating }: { rating: number }) {
  const { theme } = useTheme();
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={16} color={theme.warning} fill={n <= rating ? theme.warning : 'transparent'} />
      ))}
    </View>
  );
}

export function ReviewsSection({ contract, currentUserId }: Props) {
  const { theme } = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    listReviewsForContract(contract.id)
      .then(setReviews)
      .catch(() => undefined);
  }, [contract.id]);

  const otherPartyId = currentUserId === contract.clientId ? contract.seekerId : contract.clientId;
  const myReview = reviews.find((r) => r.reviewerId === currentUserId) ?? null;
  const theirReview = reviews.find((r) => r.reviewerId === otherPartyId) ?? null;

  function handleSaved(review: Review) {
    setReviews((prev) => {
      const exists = prev.some((r) => r.id === review.id);
      return exists ? prev.map((r) => (r.id === review.id ? review : r)) : [...prev, review];
    });
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Reviews</Text>

      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Text style={[styles.blockLabel, { color: theme.text }]}>Your review</Text>
          <Button
            title={myReview ? 'Edit' : 'Leave review'}
            variant={myReview ? 'ghost' : 'secondary'}
            onPress={() => setModalOpen(true)}
            style={styles.editButton}
          />
        </View>
        {myReview ? (
          <>
            <StarRow rating={myReview.rating} />
            <Text style={[styles.comment, { color: theme.textSecondary }]}>{myReview.comment}</Text>
          </>
        ) : (
          <Text style={[styles.placeholder, { color: theme.textMuted }]}>You haven&apos;t left a review yet.</Text>
        )}
      </View>

      <View style={styles.block}>
        <Text style={[styles.blockLabel, { color: theme.text }]}>Their review</Text>
        {theirReview ? (
          <>
            <StarRow rating={theirReview.rating} />
            <Text style={[styles.comment, { color: theme.textSecondary }]}>{theirReview.comment}</Text>
          </>
        ) : (
          <Text style={[styles.placeholder, { color: theme.textMuted }]}>Waiting for their review.</Text>
        )}
      </View>

      <ReviewModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        contractId={contract.id}
        existing={myReview}
        onSaved={handleSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, marginBottom: spacing.md },
  block: { marginBottom: spacing.lg },
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  blockLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  editButton: { height: 32, paddingHorizontal: spacing.sm },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: spacing.xs },
  comment: { fontSize: typography.sizes.sm },
  placeholder: { fontSize: typography.sizes.sm },
});
