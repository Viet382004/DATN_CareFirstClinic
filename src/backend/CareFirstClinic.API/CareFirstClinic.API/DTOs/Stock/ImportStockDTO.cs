using System.ComponentModel.DataAnnotations;

namespace CareFirstClinic.API.DTOs
{
    // Dùng khi nhập thêm hàng vào kho
    public class ImportStockDTO
    {
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng nhập phải lớn hơn 0.")]
        public int Quantity { get; set; }
    }
}