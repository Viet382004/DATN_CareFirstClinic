using VNPAY;
using VNPAY.Models;
using VNPAY.Models.Enums;
using VNPAY.Models.Exceptions;
using System.Reflection;

namespace CareFirstClinic.API.Services
{
    public interface IVNPayService
    {
        /// Tạo URL thanh toán VNPay — redirect user sang trang VNPay
        string CreatePaymentUrl(VNPayPaymentRequest request, string ipAddress);

        /// Xác thực chữ ký từ VNPay callback — tránh giả mạo
        bool ValidateSignature(IQueryCollection query, out string transactionStatus);

        /// Parse kết quả từ VNPay return URL
        VNPayReturnResult ParseReturnUrl(IQueryCollection query);
    }

    public class VNPayService : IVNPayService
    {
        private readonly IVnpayClient _vnpayClient;
        private readonly ILogger<VNPayService> _logger;

        public VNPayService(IVnpayClient vnpayClient, ILogger<VNPayService> logger)
        {
            _vnpayClient = vnpayClient;
            _logger = logger;
        }

        public string CreatePaymentUrl(VNPayPaymentRequest request, string ipAddress)
        {
            if (!long.TryParse(request.OrderId, out var paymentId))
            {
                throw new ArgumentException(
                    "OrderId phải là chuỗi số khi dùng thư viện VNPAY.NET (ví dụ: 1744805624123123).",
                    nameof(request.OrderId));
            }

            var vnpayRequest = new VnpayPaymentRequest
            {
                Money = decimal.ToDouble(request.Amount),
                Description = string.IsNullOrWhiteSpace(request.Description)
                    ? $"Thanh toan don hang {request.OrderId}"
                    : request.Description.Trim(),
                BankCode = BankCode.ANY,
                Language = DisplayLanguage.Vietnamese
            };

            var paymentIdProperty = typeof(VnpayPaymentRequest).GetProperty(
                "PaymentId",
                BindingFlags.Instance | BindingFlags.Public);
            paymentIdProperty?.SetValue(vnpayRequest, paymentId);

            var paymentUrlInfo = _vnpayClient.CreatePaymentUrl(vnpayRequest);

            return paymentUrlInfo.Url;
        }

        public bool ValidateSignature(IQueryCollection query, out string transactionStatus)
        {
            transactionStatus = query["vnp_TransactionStatus"].FirstOrDefault() ?? "";
            try
            {
                _vnpayClient.GetPaymentResult(query);
                return true;
            }
            catch (VnpayException ex) when (ex.Message.Contains("Chữ ký xác thực", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
            catch (VnpayException)
            {
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "VNPay validate signature failed due to malformed query.");
                return false;
            }
        }

        public VNPayReturnResult ParseReturnUrl(IQueryCollection query)
        {
            var fallback = new VNPayReturnResult
            {
                OrderId = query["vnp_TxnRef"].FirstOrDefault() ?? "",
                TransactionId = query["vnp_TransactionNo"].FirstOrDefault() ?? "",
                Amount = long.TryParse(query["vnp_Amount"].FirstOrDefault(), out var amt) ? amt / 100 : 0,
                ResponseCode = query["vnp_ResponseCode"].FirstOrDefault() ?? "",
                TransactionStatus = query["vnp_TransactionStatus"].FirstOrDefault() ?? "",
                BankCode = query["vnp_BankCode"].FirstOrDefault() ?? "",
                PayDate = query["vnp_PayDate"].FirstOrDefault() ?? "",
                SecureHash = query["vnp_SecureHash"].FirstOrDefault() ?? ""
            };

            try
            {
                var result = _vnpayClient.GetPaymentResult(query);
                fallback.OrderId = result.PaymentId.ToString();
                fallback.TransactionId = result.VnpayTransactionId.ToString();
                fallback.BankCode = result.BankingInfor?.BankCode ?? fallback.BankCode;
                fallback.PayDate = result.Timestamp.ToString("yyyyMMddHHmmss");
                fallback.IsSuccess = true;
                return fallback;
            }
            catch (VnpayException)
            {
                fallback.IsSuccess = false;
                return fallback;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "VNPay ParseReturnUrl fallback mode.");
                fallback.IsSuccess = fallback.ResponseCode == "00" && fallback.TransactionStatus == "00";
                return fallback;
            }
        }
    }

    // Request / Response models
    public class VNPayPaymentRequest
    {
        public string OrderId { get; set; } = string.Empty;   // Mã đơn hàng unique
        public decimal Amount { get; set; }                    // Số tiền VND
        public string Description { get; set; } = string.Empty;
    }

    public class VNPayReturnResult
    {
        public string OrderId { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public long Amount { get; set; }
        public string ResponseCode { get; set; } = string.Empty;
        public string TransactionStatus { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public string BankCode { get; set; } = string.Empty;
        public string PayDate { get; set; } = string.Empty;
        public string SecureHash { get; set; } = string.Empty;
    }
}