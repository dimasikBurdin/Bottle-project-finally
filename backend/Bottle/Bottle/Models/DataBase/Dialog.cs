using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bottle.Models.DataBase
{
    public class Dialog
    {
        public int Id { get; set; }
        public bool Active { get; set; } = true;
        public int? BottleRate { get; set; }
        public int? RecipientRate { get; set; }

        public int? BottleId { get; set; }
        [ForeignKey("BottleId")]
        public Bottle Bottle { get; set; }

        public string BottleOwnerId { get; set; }
        public User BottleOwner { get; set; }

        public string RecipientId { get; set; }
        public User Recipient { get; set; }

        public List<Message> Messages { get; set; }
    }
}