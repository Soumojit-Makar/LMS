import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, Download, CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/axios';
import PageLoader from '../../components/common/PageLoader';

export default function CertificatePage() {
  const { courseId } = useParams<{ courseId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['cert-eligibility', courseId],
    queryFn: () => api.get(`/certificates/${courseId}/eligibility`).then((r) => r.data.data),
  });

  const handleDownload = async () => {
    const res = await api.get(`/certificates/${courseId}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a'); a.href = url; a.download = `certificate-${courseId}.pdf`; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-lg mx-auto py-16 text-center px-4">
      <div className={`inline-flex h-20 w-20 items-center justify-center rounded-full mb-6 ${data?.eligible ? 'bg-green-50' : 'bg-gray-100'}`}>
        {data?.eligible ? <Award className="h-10 w-10 text-green-500" /> : <XCircle className="h-10 w-10 text-gray-400" />}
      </div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
        {data?.eligible ? 'Certificate Ready!' : 'Not Yet Eligible'}
      </h1>
      {data?.eligible ? (
        <>
          <p className="text-gray-500 mb-8">Congratulations on completing this course! Your certificate is ready to download.</p>
          <button onClick={handleDownload} className="btn-primary gap-2 px-8 py-3">
            <Download className="h-4 w-4" /> Download Certificate
          </button>
        </>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-gray-500">Complete the following to unlock your certificate:</p>
          <div className="card p-4 text-left space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {(data?.progressPercent || 0) >= 100 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-400" />}
              <span>Complete all lessons ({data?.progressPercent || 0}%)</span>
            </div>
            {data?.reason === 'Pass the quiz' && (
              <div className="flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4 text-red-400" />
                <span>Pass the course quiz</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}