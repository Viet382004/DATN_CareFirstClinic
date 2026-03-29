namespace CareFirstClinic.API.Services
{
    public interface IImageService
    {
        Task<string> UploadAvatarAsync(IFormFile file, string folder);

        Task DeleteAvatarAsync(string? avatarUrl);
    }
}