// ════════════════════════════════════════════════════════════════
// PaymentPage.tsx — Trang thanh toán VNPay
// Dùng ở 2 chỗ:
//   1. /payment  → Chọn phương thức và bắt đầu thanh toán
//   2. /payment/result  → Hiển thị kết quả sau khi VNPay redirect về
// ════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import vnpayService from "../../../services/Vnpayservice";
import type { Appointment } from "../../../types/appointment";

// ── Trang chọn thanh toán ─────────────────────────────────────────
interface PaymentCheckoutProps {
    appointment: Appointment;
    amount: number;
    onBack: () => void;
}

export function PaymentCheckout({ appointment, amount, onBack }: PaymentCheckoutProps) {
    const [loading, setLoading] = useState(false);
    const [method, setMethod] = useState<"vnpay" | "cash">("vnpay");

    const handlePay = async () => {
        if (method === "cash") {
            alert("Vui lòng thanh toán tại quầy lễ tân phòng khám.");
            return;
        }

        setLoading(true);
        try {
            const res = await vnpayService.createPayment({
                appointmentId: appointment.id,
                amount,
            });

            // Redirect sang trang thanh toán VNPay
            window.location.href = res.paymentUrl;
        } catch (err: any) {
            alert(err?.message || "Không thể tạo liên kết thanh toán. Vui lòng thử lại.");
            setLoading(false);
        }
    };

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-xl">💳</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">Thanh toán hóa đơn</h1>
                    <p className="text-gray-500 text-sm mt-1">Chọn phương thức thanh toán</p>
                </div>

                {/* Order summary */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                    <h2 className="font-bold text-gray-900 mb-3 text-sm">Chi tiết hóa đơn</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Bác sĩ</span>
                            <span className="font-medium text-gray-800">{appointment.doctorName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Chuyên khoa</span>
                            <span className="font-medium text-gray-800">{appointment.specialtyName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Ngày khám</span>
                            <span className="font-medium text-gray-800">
                                {new Date(appointment.workDate).toLocaleDateString("vi-VN")}
                            </span>
                        </div>
                        <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between items-center">
                            <span className="font-semibold text-gray-700">Tổng tiền</span>
                            <span className="text-xl font-black text-teal-600">{formatCurrency(amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment methods */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
                    <h2 className="font-bold text-gray-900 mb-3 text-sm">Phương thức thanh toán</h2>
                    <div className="space-y-3">
                        {/* VNPay */}
                        <button
                            onClick={() => setMethod("vnpay")}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${method === "vnpay"
                                    ? "border-teal-500 bg-teal-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-black text-xs">VNPAY</span>
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800 text-sm">VNPay</p>
                                <p className="text-xs text-gray-400">
                                    Thẻ ATM, Visa, MasterCard, QR Code
                                </p>
                            </div>
                            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === "vnpay" ? "border-teal-500" : "border-gray-300"
                                }`}>
                                {method === "vnpay" && (
                                    <div className="w-2.5 h-2.5 bg-teal-500 rounded-full" />
                                )}
                            </div>
                        </button>

                        {/* Tiền mặt */}
                        <button
                            onClick={() => setMethod("cash")}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${method === "cash"
                                    ? "border-teal-500 bg-teal-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xl">💵</span>
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-gray-800 text-sm">Tiền mặt</p>
                                <p className="text-xs text-gray-400">Thanh toán tại quầy lễ tân</p>
                            </div>
                            <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === "cash" ? "border-teal-500" : "border-gray-300"
                                }`}>
                                {method === "cash" && (
                                    <div className="w-2.5 h-2.5 bg-teal-500 rounded-full" />
                                )}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Security note */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                    <p className="text-xs text-blue-700 flex items-start gap-2">
                        <span className="text-base flex-shrink-0">🔒</span>
                        <span>
                            Thanh toán được bảo mật bởi VNPay. Thông tin thẻ của bạn được mã hóa
                            và không lưu trữ trên hệ thống của chúng tôi.
                        </span>
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                    >
                        Quay lại
                    </button>
                    <button
                        onClick={handlePay}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            `Thanh toán ${formatCurrency(amount)}`
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ── Trang kết quả thanh toán ──────────────────────────────────────
export function PaymentResult() {
    const [result, setResult] = useState<{
        isSuccess: boolean;
        message: string;
        amount: number;
        transactionId: string;
        orderId: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                // Lấy toàn bộ query string từ URL hiện tại
                const queryString = window.location.search;
                if (!queryString) {
                    setResult({
                        isSuccess: false,
                        message: "Không tìm thấy thông tin giao dịch",
                        amount: 0,
                        transactionId: "",
                        orderId: "",
                    });
                    return;
                }

                const data = await vnpayService.getReturnResult(queryString);
                setResult({
                    isSuccess: data.isSuccess,
                    message: data.message,
                    amount: data.amount,
                    transactionId: data.transactionId,
                    orderId: data.orderId,
                });
            } catch {
                setResult({
                    isSuccess: false,
                    message: "Lỗi xử lý kết quả thanh toán",
                    amount: 0,
                    transactionId: "",
                    orderId: "",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, []);

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Đang xử lý kết quả...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${result?.isSuccess ? "bg-emerald-100" : "bg-red-100"
                        }`}>
                        <span className="text-4xl">{result?.isSuccess ? "✅" : "❌"}</span>
                    </div>

                    {/* Title */}
                    <h1 className={`text-2xl font-black mb-2 ${result?.isSuccess ? "text-emerald-600" : "text-red-600"
                        }`}>
                        {result?.isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
                    </h1>
                    <p className="text-gray-500 text-sm mb-6">{result?.message}</p>

                    {/* Details */}
                    {result && (
                        <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
                            {result.amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số tiền</span>
                                    <span className="font-bold text-teal-600">
                                        {formatCurrency(result.amount)}
                                    </span>
                                </div>
                            )}
                            {result.transactionId && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Mã GD VNPay</span>
                                    <span className="font-medium text-gray-800 font-mono text-xs">
                                        {result.transactionId}
                                    </span>
                                </div>
                            )}
                            {result.orderId && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Mã đơn hàng</span>
                                    <span className="font-medium text-gray-800 font-mono text-xs">
                                        {result.orderId}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <a href="/"
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors text-center">
                            Về trang chủ
                        </a>
                        <a href="/patient-dashboard"
                            className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-colors text-center">
                            {result?.isSuccess ? "Xem lịch hẹn" : "Thử lại"}
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}