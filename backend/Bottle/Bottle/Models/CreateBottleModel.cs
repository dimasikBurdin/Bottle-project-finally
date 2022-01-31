using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Models
{
    public class CreateBottleModel
    {
        public decimal Lat { get; set; }
        public decimal Lng { get; set; }
        public string GeoObjectName { get; set; }
        public string Address { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int ContentItemsCount { get; set; }
        public string Category { get; set; }
        public long LifeTime { get; set; }
        public int MaxPickingUp { get; set; }
    }
}
