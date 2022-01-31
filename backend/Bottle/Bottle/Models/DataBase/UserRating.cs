using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bottle.Models.DataBase
{
    public class UserRating
    {
        public int Id { get; set; }
        public System.DateTime DateTime { get; set; }
        public int Value { get; set; }
        public User User { get; set; }
        public string UserId { get; set; }
    }
}
