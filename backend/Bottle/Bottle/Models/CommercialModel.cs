using Bottle.Models.DataBase;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Models
{
    public class CommercialModel
    {
        public CommercialModel()
        {

        }

        public CommercialModel(CommercialData data)
        {
            FullName = data.FullName;
            IdentificationNumber = data.IdentificationNumber;
            ContactPerson = data.ContactPerson;
            Email = data.Email;
            PhoneNumber = data.PhoneNumber;
            PSRN = data.PSRN;
        }

        [Required]
        public string FullName { get; set; }

        [Required]
        public string ContactPerson { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string PhoneNumber { get; set; }

        [Required]
        public string IdentificationNumber { get; set; }

        [Required]
        public string PSRN { get; set; }
    }
}
