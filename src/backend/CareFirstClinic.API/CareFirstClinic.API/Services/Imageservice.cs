namespace CareFirstClinic.API.Services
{
    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<ImageService> _logger;

        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

        private const long MaxFileSize = 5 * 1024 * 1024;

        public ImageService(IWebHostEnvironment env, ILogger<ImageService> logger)
        {
            _env = env;
            _logger = logger;
        }

        public async Task<string> UploadAvatarAsync(IFormFile file, string folder)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File không được để trống.");

            if (file.Length > MaxFileSize)
                throw new ArgumentException("Kích thước ảnh không được vượt quá 5MB.");

            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                throw new ArgumentException("Chỉ chấp nhận file JPG, PNG, WEBP.");

            var uploadFolder = Path.Combine(
                _env.WebRootPath, "uploads", "avatars", folder);

            if (!Directory.Exists(uploadFolder))
                Directory.CreateDirectory(uploadFolder);

            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var relativeUrl = $"/uploads/avatars/{folder}/{fileName}";
            _logger.LogInformation("Upload ảnh thành công: {Url}", relativeUrl);

            return relativeUrl;
        }

        public async Task DeleteAvatarAsync(string? avatarUrl)
        {
            if (string.IsNullOrWhiteSpace(avatarUrl)) return;

            try
            {
                var filePath = Path.Combine(
                    _env.WebRootPath,
                    avatarUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    _logger.LogInformation("Đã xóa ảnh cũ: {Path}", filePath);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không thể xóa ảnh cũ: {Url}", avatarUrl);
            }

            await Task.CompletedTask;
        }
    }
}