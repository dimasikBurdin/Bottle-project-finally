using System.Collections.Generic;

namespace Bottle.Models.DataBase
{
    public class UserType
    {
        public int Id { get; set; }
        public string Type { get; set; }

        public List<User> Users { get; set; }
    }
}
