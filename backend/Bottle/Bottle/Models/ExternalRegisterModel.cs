using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Models
{
    public class ExternalRegisterModel
    {
        [Required]
        public ExternalLoginModel ExternalLogin { get; set; }

        [Required]
        public string Nickname { get; set; }

        [Required]
        public string Sex { get; set; }

        public CommercialModel CommercialData { get; set; }
    }
}
