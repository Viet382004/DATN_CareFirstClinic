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
        private readonly IEmailService _emailService;

        public PrescriptionService(
            IPrescriptionRepository prescriptionRepo,
            CareFirstClinicDbContext context,
            ILogger<PrescriptionService> logger,
            IEmailService emailService)
        {
            _prescriptionRepo = prescriptionRepo;
            _context = context;
            _logger = logger;
            _emailService = emailService;
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

            var exists = await _prescriptionRepo.ExistsByMedicalRecordIdAsync(dto.MedicalRecordId);
            if (exists)
                throw new InvalidOperationException("Hồ sơ bệnh án này đã có đơn thuốc.");

            // Kiểm tra tồn kho và tạo chi tiết
            var details = new List<PrescriptionDetail>();
            foreach (var d in dto.Details)
            {
                var stock = await _context.Stocks.FirstOrDefaultAsync(s => s.Id == d.StockId && s.IsActive);
                if (stock is null)
                    throw new KeyNotFoundException($"Không tìm thấy thuốc với Id: {d.StockId}");
                if (stock.Quantity < d.Quantity)
                    throw new InvalidOperationException($"Thuốc '{stock.MedicineName}' không đủ tồn kho.");

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

            // We don't subtract stock here anymore, it will be subtracted in DispenseAsync
            // But we keep the check above to warn the doctor if stock is low.

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
            await _context.SaveChangesAsync();

            var result = await _prescriptionRepo.GetByIdAsync(created.Id);

            // 🔑 Lấy dữ liệu email ngay trong scope
            var medicalRecord = await _context.MedicalRecords
                .Include(m => m.Patient).ThenInclude(p => p!.User)
                .Include(m => m.Doctor)
                .FirstOrDefaultAsync(m => m.Id == dto.MedicalRecordId);

            var email = medicalRecord?.Patient?.User?.Email;
            var patientName = medicalRecord?.Patient?.FullName;
            var doctorName = medicalRecord?.Doctor?.FullName;

            var emailItems = result!.Details.Select(d => new PrescriptionEmailItem
            {
                MedicineName = d.Stock?.MedicineName ?? string.Empty,
                Unit = d.Stock?.Unit,
                Frequency = d.Frequency,
                DurationDays = d.DurationDays,
                Quantity = d.Quantity,
                Instructions = d.Instructions
            }).ToList();

            if (!string.IsNullOrWhiteSpace(email))
            {
                _ = Task.Run(() => _emailService.SendPrescriptionAsync(
                    email, patientName!, doctorName!, result.IssuedAt, emailItems, result.Notes));
            }

            return MapToDTO(result!);
        }


        public async Task<PrescriptionDTO> UpdateAsync(Guid prescriptionId, UpdatePrescriptionDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);
            if (prescriptionId == Guid.Empty)
                throw new ArgumentException("Id đơn thuốc không hợp lệ.", nameof(prescriptionId));

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var p = await _context.Prescriptions
                    .Include(x => x.Details)
                    .ThenInclude(d => d.Stock)
                    .FirstOrDefaultAsync(x => x.Id == prescriptionId);

                if (p == null)
                    throw new KeyNotFoundException($"Không tìm thấy đơn thuốc với Id: {prescriptionId}");

                // 24h Restriction Check (If doctor dashboard logic is bypassed)
                var medicalRecord = await _context.MedicalRecords.FindAsync(p.MedicalRecordId);
                if (medicalRecord != null && (DateTime.UtcNow - medicalRecord.CreatedAt).TotalHours > 24)
                {
                    throw new InvalidOperationException("Hồ sơ bệnh án đã quá 24h, không thể chỉnh sửa đơn thuốc.");
                }

                // 1. Phục hồi tồn kho cũ (Chỉ khi đã phát thuốc)
                if (p.Status == PrescriptionStatus.Dispensed)
                {
                    foreach (var oldDetail in p.Details)
                    {
                        if (oldDetail.Stock != null)
                        {
                            oldDetail.Stock.Quantity += oldDetail.Quantity;
                        }
                    }
                }

                // 2. Xóa các chi tiết cũ
                _context.PrescriptionDetails.RemoveRange(p.Details);

                // 3. Kiểm tra và trừ tồn kho mới
                var newDetails = new List<PrescriptionDetail>();
                foreach (var d in dto.Details)
                {
                    var stock = await _context.Stocks.FirstOrDefaultAsync(s => s.Id == d.StockId && s.IsActive);
                    if (stock is null)
                        throw new KeyNotFoundException($"Không tìm thấy thuốc với Id: {d.StockId}");
                    
                    if (stock.Quantity < d.Quantity)
                        throw new InvalidOperationException($"Thuốc '{stock.MedicineName}' không đủ tồn kho (Còn {stock.Quantity}).");

                    if (p.Status == PrescriptionStatus.Dispensed)
                    {
                        stock.Quantity -= d.Quantity;
                    }

                    newDetails.Add(new PrescriptionDetail
                    {
                        Id = Guid.NewGuid(),
                        PrescriptionId = prescriptionId,
                        StockId = d.StockId,
                        Frequency = d.Frequency.Trim(),
                        DurationDays = d.DurationDays,
                        Quantity = d.Quantity,
                        Instructions = d.Instructions?.Trim()
                    });
                }

                p.Notes = dto.Notes?.Trim();
                p.Details = newDetails;
                p.IssuedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var result = await _prescriptionRepo.GetByIdAsync(prescriptionId);
                return MapToDTO(result!);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Lỗi Update Prescription Id: {Id}", prescriptionId);
                throw;
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