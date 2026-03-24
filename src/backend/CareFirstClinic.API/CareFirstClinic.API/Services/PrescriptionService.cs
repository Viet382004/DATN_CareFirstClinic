using CareFirstClinic.API.Data;
using CareFirstClinic.API.DTOs;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories;
using Microsoft.EntityFrameworkCore;

namespace CareFirstClinic.API.Services
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly IPrescriptionRepository _prescriptionRepo;
        private readonly CareFirstClinicDbContext _context;
        private readonly ILogger<PrescriptionService> _logger;

        public PrescriptionService(
            IPrescriptionRepository prescriptionRepo,
            CareFirstClinicDbContext context,
            ILogger<PrescriptionService> logger)
        {
            _prescriptionRepo = prescriptionRepo;
            _context = context;
            _logger = logger;
        }

        public async Task<PrescriptionDTO?> GetByIdAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var p = await _prescriptionRepo.GetByIdAsync(id);
                return p is null ? null : MapToDTO(p);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetById Id: {Id}", id);
                throw new ApplicationException("Không thể lấy đơn thuốc.", ex);
            }
        }

        public async Task<PrescriptionDTO?> GetByMedicalRecordIdAsync(Guid medicalRecordId)
        {
            if (medicalRecordId == Guid.Empty)
                throw new ArgumentException("MedicalRecordId không được để trống.", nameof(medicalRecordId));
            try
            {
                var p = await _prescriptionRepo.GetByMedicalRecordIdAsync(medicalRecordId);
                return p is null ? null : MapToDTO(p);
            }
            catch (ArgumentException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi GetByMedicalRecordId: {Id}", medicalRecordId);
                throw new ApplicationException("Không thể lấy đơn thuốc.", ex);
            }
        }

        public async Task<PrescriptionDTO> CreateAsync(Guid doctorId, CreatePrescriptionDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);
            if (doctorId == Guid.Empty)
                throw new ArgumentException("DoctorId không hợp lệ.", nameof(doctorId));

            // 1 MedicalRecord chỉ có 1 Prescription
            var exists = await _prescriptionRepo.ExistsByMedicalRecordIdAsync(dto.MedicalRecordId);
            if (exists)
                throw new InvalidOperationException("Hồ sơ bệnh án này đã có đơn thuốc.");

            // Kiểm tra tất cả Stock tồn tại và còn hàng
            var details = new List<PrescriptionDetail>();
            foreach (var d in dto.Details)
            {
                var stock = await _context.Stocks
                    .FirstOrDefaultAsync(s => s.Id == d.StockId && s.IsActive);

                if (stock is null)
                    throw new KeyNotFoundException($"Không tìm thấy thuốc với Id: {d.StockId}");

                if (stock.Quantity < d.Quantity)
                    throw new InvalidOperationException(
                        $"Thuốc '{stock.MedicineName}' không đủ tồn kho. " +
                        $"Còn {stock.Quantity} {stock.Unit}, cần {d.Quantity}.");

                details.Add(new PrescriptionDetail
                {
                    Id = Guid.NewGuid(),
                    StockId = d.StockId,
                    Frequency = d.Frequency.Trim(),
                    DurationDays = d.DurationDays,
                    Quantity = d.Quantity,
                    Instructions = d.Instructions?.Trim()
                });
            }

            try
            {
                var prescription = new Prescription
                {
                    Id = Guid.NewGuid(),
                    MedicalRecordId = dto.MedicalRecordId,
                    Status = PrescriptionStatus.Issued,
                    Notes = dto.Notes?.Trim(),
                    IssuedAt = DateTime.UtcNow,
                    Details = details
                };

                var created = await _prescriptionRepo.AddAsync(prescription);
                var result = await _prescriptionRepo.GetByIdAsync(created.Id);
                return MapToDTO(result!);
            }
            catch (KeyNotFoundException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Create Prescription.");
                throw new ApplicationException("Không thể tạo đơn thuốc.", ex);
            }
        }

        // Phát thuốc — trừ tồn kho, dùng transaction
        public async Task<PrescriptionDTO?> DispenseAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var prescription = await _context.Prescriptions
                    .Include(p => p.Details)
                        .ThenInclude(d => d.Stock)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (prescription is null) return null;

                if (prescription.Status != PrescriptionStatus.Issued)
                    throw new InvalidOperationException(
                        $"Không thể phát thuốc cho đơn đang ở trạng thái '{prescription.Status}'.");

                // Kiểm tra lại tồn kho trước khi trừ
                foreach (var detail in prescription.Details)
                {
                    if (detail.Stock is null)
                        throw new InvalidOperationException("Dữ liệu thuốc không hợp lệ.");

                    if (detail.Stock.Quantity < detail.Quantity)
                        throw new InvalidOperationException(
                            $"Thuốc '{detail.Stock.MedicineName}' không đủ tồn kho. " +
                            $"Còn {detail.Stock.Quantity}, cần {detail.Quantity}.");
                }

                // Trừ tồn kho
                foreach (var detail in prescription.Details)
                {
                    detail.Stock!.Quantity -= detail.Quantity;

                    if (detail.Stock.Quantity <= detail.Stock.MinQuantity)
                        _logger.LogWarning(
                            "Thuốc {Name} sắp hết hàng, còn {Qty} {Unit}.",
                            detail.Stock.MedicineName, detail.Stock.Quantity, detail.Stock.Unit);
                }

                prescription.Status = PrescriptionStatus.Dispensed;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var result = await _prescriptionRepo.GetByIdAsync(id);
                return MapToDTO(result!);
            }
            catch (InvalidOperationException) { await transaction.RollbackAsync(); throw; }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Lỗi Dispense Prescription Id: {Id}", id);
                throw new ApplicationException("Không thể phát thuốc.", ex);
            }
        }

        public async Task<PrescriptionDTO?> CancelAsync(Guid id)
        {
            if (id == Guid.Empty)
                throw new ArgumentException("Id không được để trống.", nameof(id));
            try
            {
                var prescription = await _prescriptionRepo.GetByIdAsync(id);
                if (prescription is null) return null;

                if (prescription.Status == PrescriptionStatus.Dispensed)
                    throw new InvalidOperationException("Không thể hủy đơn thuốc đã phát.");

                if (prescription.Status == PrescriptionStatus.Cancelled)
                    throw new InvalidOperationException("Đơn thuốc này đã bị hủy rồi.");

                var updated = await _prescriptionRepo.UpdateStatusAsync(id, PrescriptionStatus.Cancelled);
                return MapToDTO(updated);
            }
            catch (ArgumentException) { throw; }
            catch (InvalidOperationException) { throw; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Cancel Prescription Id: {Id}", id);
                throw new ApplicationException("Không thể hủy đơn thuốc.", ex);
            }
        }

        private static PrescriptionDTO MapToDTO(Prescription p) => new()
        {
            Id = p.Id,
            MedicalRecordId = p.MedicalRecordId,
            Status = p.Status.ToString(),
            Notes = p.Notes,
            IssuedAt = p.IssuedAt,
            Details = p.Details.Select(d => new PrescriptionDetailDTO
            {
                Id = d.Id,
                StockId = d.StockId,
                MedicineName = d.Stock?.MedicineName ?? string.Empty,
                MedicineCode = d.Stock?.MedicineCode,
                Unit = d.Stock?.Unit,
                Frequency = d.Frequency,
                DurationDays = d.DurationDays,
                Quantity = d.Quantity,
                Instructions = d.Instructions,
                UnitPrice = d.Stock?.UnitPrice ?? 0
            }).ToList()
        };
    }
}