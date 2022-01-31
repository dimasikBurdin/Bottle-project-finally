using Bottle.Models.DataBase;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bottle.Models.DataBase
{
    public class CommercialData
    {

        public CommercialData()
        {

        }

        public CommercialData(CommercialModel model)
        {
            FullName = model.FullName;
            IdentificationNumber = model.IdentificationNumber;
            ContactPerson = model.ContactPerson;
            Email = model.Email;
            PhoneNumber = model.PhoneNumber;
            PSRN = model.PSRN;
        }

        public string Id { get; set; }
        public string FullName { get; set; }
        public string ContactPerson { get; set; }
        public string IdentificationNumber { get; set; }
        public string PSRN { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }

        [ForeignKey("Id")]
        public User User { get; set; }
    }
}