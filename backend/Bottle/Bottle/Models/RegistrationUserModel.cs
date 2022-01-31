using System.ComponentModel.DataAnnotations;

namespace Bottle.Models
{
    public class RegistrationUserModel
    {
        [Required]
        public string Nickname { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string Sex { get; set; }

        public CommercialModel CommercialData { get; set; }
    }
}
