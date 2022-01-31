using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Models
{
    public class WebSocketRequestModel
    {
        public EventType EventNumber { get; set; }
        public object Model { get; set; }

        public enum EventType
        {
            SendMessage = 1,
            CloseDialog = 2,
            CreateBottle = 3,
            CreateDialog = 4,
            BottlePickedUp = 5,
            BottleEndLife = 6
        }
    }
}
