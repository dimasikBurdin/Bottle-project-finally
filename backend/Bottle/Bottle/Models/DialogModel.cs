using Bottle.Models.DataBase;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Models
{
    public class DialogModel
    {
        public DialogModel()
        {

        }

        public DialogModel(Dialog dialog)
        {
            Id = dialog.Id;
            BottleId = dialog.BottleId;
            BottleOwnerId = dialog.BottleOwnerId;
            RecipientId = dialog.RecipientId;
            Active = dialog.Active;
        }

        public DialogModel(Dialog dialog, Message lastMessage) : this(dialog)
        {
            if (lastMessage != null)
                LastMessage = new MessageModel(lastMessage);
        }

        public int Id { get; set; }
        public int? BottleId { get; set; }
        public string BottleOwnerId { get; set; }
        public string RecipientId { get; set; }
        public bool Active { get; set; }
        public MessageModel LastMessage { get; set; }
    }
}
