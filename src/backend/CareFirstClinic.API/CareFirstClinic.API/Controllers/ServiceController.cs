using CareFirstClinic.API.DTOs.ClinicalService;
using CareFirstClinic.API.Models;
using CareFirstClinic.API.Repositories.ClinicalServiceRepo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareFirstClinic.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceRepository _serviceRepo;

        public ServiceController(IServiceRepository serviceRepo)
        {
            _serviceRepo = serviceRepo;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var services = await _serviceRepo.GetAllAsync();
            return Ok(services);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var service = await _serviceRepo.GetByIdAsync(id);
            if (service == null) return NotFound();
            return Ok(service);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateServiceDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var service = new Service
            {
                Name = dto.Name,
                Price = dto.Price,
                Description = dto.Description,
                SpecialtyId = dto.SpecialtyId,
                IsActive = true,
                Fields = dto.Fields.Select(f => new ServiceField
                {
                    FieldName = f.FieldName,
                    Unit = f.Unit,
                    DataType = f.DataType
                }).ToList()
            };

            var result = await _serviceRepo.AddAsync(service);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateServiceDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var service = await _serviceRepo.GetByIdAsync(id);
            if (service == null) return NotFound();

            service.Name = dto.Name;
            service.Price = dto.Price;
            service.Description = dto.Description;
            service.SpecialtyId = dto.SpecialtyId;
            
            // Handle fields update
            service.Fields.Clear();
            foreach (var f in dto.Fields)
            {
                service.Fields.Add(new ServiceField
                {
                    FieldName = f.FieldName,
                    Unit = f.Unit,
                    DataType = f.DataType
                });
            }

            await _serviceRepo.UpdateAsync(service);
            return Ok(service);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var service = await _serviceRepo.GetByIdAsync(id);
            if (service == null) return NotFound();

            await _serviceRepo.DeleteAsync(id);
            return NoContent();
        }
    }
}
