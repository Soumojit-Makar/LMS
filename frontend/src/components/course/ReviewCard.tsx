import { formatDate } from '../../utils/format';
import StarRating from '../common/StarRating';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  trainerReply?: string;
  repliedAt?: string;
  createdAt: string;
  student: { name: string; avatar?: { url: string } };
}

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 shrink-0">
          {review.student.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-gray-900 text-sm">{review.student.name}</p>
            <p className="text-xs text-gray-400 shrink-0">{formatDate(review.createdAt)}</p>
          </div>
          <StarRating value={review.rating} size="sm" readOnly />
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
      {review.trainerReply && (
        <div className="mt-3 pl-4 border-l-2 border-brand-200">
          <p className="text-xs font-semibold text-brand-600 mb-1">Trainer reply</p>
          <p className="text-sm text-gray-600">{review.trainerReply}</p>
        </div>
      )}
    </div>
  );
}
