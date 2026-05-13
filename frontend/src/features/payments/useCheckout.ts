import { useState } from 'react';
import { loadRazorpayScript } from '../../lib/razorpay';
import { paymentService } from '../../services/payment.service';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const initiate = async (courseId: string) => {
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error('Failed to load payment gateway. Check your connection.'); return; }

      const orderData = await paymentService.createOrder(courseId);
      const { orderId, amount, currency, keyId, courseName } = orderData.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Digitalindian Skill Academy',
        description: courseName,
        order_id: orderId,
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#1a50ff' },
        handler: async (response: any) => {
          try {
            await paymentService.verifyPayment(response);
            toast.success('Payment successful! You are now enrolled.');
            navigate('/dashboard');
          } catch {
            toast.error('Payment verification failed. Contact support if amount was deducted.');
          }
        },
        modal: { ondismiss: () => toast('Payment cancelled.', { icon: 'ℹ️' }) },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        toast.error(`Payment failed: ${resp.error?.description || 'Unknown error'}`);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not initiate checkout.');
    } finally {
      setLoading(false);
    }
  };

  return { initiate, loading };
}