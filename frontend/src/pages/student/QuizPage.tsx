import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { quizService } from '../../services/quiz.service';
import PageLoader from '../../components/common/PageLoader';
import toast from 'react-hot-toast';

export default function QuizPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['quiz', courseId],
    queryFn: async () => {
      // Get quiz for course – we pass courseId as quizId here for simplicity
      return quizService.get(courseId!);
    },
    enabled: !!courseId,
  });

  const submitMutation = useMutation({
    mutationFn: (ans: number[]) => quizService.submit(courseId!, ans),
    onSuccess: (res) => setResult(res),
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Submission failed'),
  });

  const quiz = data?.quiz;

  const handleSubmit = () => {
    const ans = (quiz?.questions || []).map((_: any, i: number) => answers[i] ?? -1);
    if (ans.includes(-1)) { toast.error('Please answer all questions'); return; }
    submitMutation.mutate(ans);
  };

  if (isLoading) return <PageLoader />;
  if (!quiz) return <div className="text-center py-20 text-gray-500">No quiz available for this course.</div>;

  if (result) return (
    <div className="max-w-xl mx-auto py-16 text-center px-4">
      <div className={`inline-flex h-20 w-20 items-center justify-center rounded-full mb-6 ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}>
        {result.passed ? <Trophy className="h-10 w-10 text-green-500" /> : <XCircle className="h-10 w-10 text-red-500" />}
      </div>
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">{result.passed ? 'Quiz Passed!' : 'Try Again'}</h1>
      <p className="text-5xl font-display font-bold my-6 text-brand-600">{result.score}%</p>
      <p className="text-gray-500 mb-8">{result.correctCount} of {result.totalQuestions} correct · Passing score: {result.passingScore}%</p>
      <div className="flex justify-center gap-3">
        {result.passed && <button onClick={() => navigate(`/certificate/${courseId}`)} className="btn-primary">Get Certificate</button>}
        <button onClick={() => setResult(null)} className="btn-secondary"><RotateCcw className="h-4 w-4" /> Retry</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
      <p className="text-sm text-gray-500 mb-8">{quiz.questions.length} questions · Passing score: {quiz.passingScore}%</p>
      <div className="space-y-6">
        {quiz.questions.map((q: any, i: number) => (
          <div key={i} className="card p-6">
            <p className="font-medium text-gray-900 mb-4"><span className="text-brand-600 font-bold mr-2">Q{i + 1}.</span>{q.text}</p>
            <div className="space-y-2">
              {q.options.map((opt: string, j: number) => (
                <button key={j} onClick={() => setAnswers({ ...answers, [i]: j })}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${answers[i] === j ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'}`}>
                  <span className="font-medium mr-2">{String.fromCharCode(65 + j)}.</span>{opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-end">
        <button onClick={handleSubmit} disabled={submitMutation.isPending} className="btn-primary px-8 py-3">
          {submitMutation.isPending ? 'Submitting…' : 'Submit Quiz'}
        </button>
      </div>
    </div>
  );
}