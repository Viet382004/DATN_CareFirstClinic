import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { paymentService } from '../../../services/paymentService';

type ResolveState =
  | { status: 'loading'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

const PaymentResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { status: routeStatus } = useParams();
  const [state, setState] = useState<ResolveState>({
    status: 'loading',
    message: 'Đang đồng bộ kết quả thanh toán...'
  });

  const query = useMemo(() => new URLSearchParams(window.location.search), []);

  useEffect(() => {
    const resolvePayment = async () => {
      const orderId = query.get('orderId') || sessionStorage.getItem('pendingOrderId') || '';
      const targetAppointmentConfirm = sessionStorage.getItem('pendingConfirmAppointmentId');
      const walkInAppointmentId = sessionStorage.getItem('pendingAppointmentId');
      const medicineAppointmentId = sessionStorage.getItem('pendingMedicineAppointmentId');
      const patientBookingAppointmentId = sessionStorage.getItem('pendingPatientAppointmentId');
      const bookingCode = sessionStorage.getItem('pendingBookingCode');

      if (!orderId) {
        setState({ status: 'error', message: 'Không tìm thấy mã giao dịch để đối soát.' });
        return;
      }

      try {
        const paymentStatus = await paymentService.getPaymentStatus(orderId);

        if (paymentStatus.status !== 'Completed') {
          throw new Error('Giao dịch chưa hoàn tất.');
        }

        if (bookingCode) {
          localStorage.setItem('bookingCode', bookingCode);
        }

        sessionStorage.removeItem('pendingOrderId');

        if (targetAppointmentConfirm) {
          sessionStorage.removeItem('pendingConfirmAppointmentId');
          setState({ status: 'success', message: 'Thanh toán phí khám thành công. Đang quay lại quản lý lịch khám...' });
          window.setTimeout(() => navigate('/admin/appointments', { replace: true }), 1200);
          return;
        }

        if (walkInAppointmentId) {
          sessionStorage.removeItem('pendingAppointmentId');
          sessionStorage.removeItem('isAdminBooking');
          setState({ status: 'success', message: 'Đặt lịch hộ và thanh toán thành công. Đang quay lại màn đặt lịch tại quầy...' });
          window.setTimeout(() => navigate('/admin/walk-in', { replace: true }), 1200);
          return;
        }

        if (medicineAppointmentId) {
          sessionStorage.removeItem('pendingMedicineAppointmentId');
          setState({ status: 'success', message: 'Thanh toán tiền thuốc thành công. Đang quay lại quản lý hóa đơn...' });
          window.setTimeout(() => navigate('/admin/billing', { replace: true }), 1200);
          return;
        }

        if (patientBookingAppointmentId) {
          sessionStorage.removeItem('pendingPatientAppointmentId');
          setState({ status: 'success', message: 'Thanh toán phí khám thành công. Đang hoàn tất đặt lịch...' });
          window.setTimeout(() => navigate('/patient/booking/success', { replace: true }), 1200);
          return;
        }

        setState({ status: 'success', message: 'Thanh toán thành công.' });
      } catch (error: any) {
        const message =
          routeStatus === 'failed'
            ? query.get('message') || 'Thanh toán thất bại.'
            : error?.message || 'Không thể xác minh trạng thái thanh toán.';
        setState({ status: 'error', message });
      }
    };

    void resolvePayment();
  }, [navigate, query, routeStatus]);

  const isLoading = state.status === 'loading';
  const isSuccess = state.status === 'success';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 shadow-xl p-8 text-center">
        <div className="flex justify-center mb-5">
          {isLoading ? (
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : isSuccess ? (
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-rose-600" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-black text-slate-900">
          {isLoading ? 'Đang xử lý thanh toán' : isSuccess ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất'}
        </h1>
        <p className="mt-3 text-sm text-slate-500">{state.message}</p>

        {!isLoading && (
          <button
            onClick={() => navigate('/', { replace: true })}
            className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-all"
          >
            Về trang chủ
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
