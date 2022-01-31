using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Models
{
    public class BottleModel
    {
        public BottleModel()
        {

        }

        public BottleModel(DataBase.Bottle entityBottle)
        {
            Id = entityBottle.Id;
            Lat = entityBottle.Lat;
            Lng = entityBottle.Lng;
            GeoObjectName = entityBottle.GeoObjectName;
            Address = entityBottle.Address;
            Title = entityBottle.Title;
            Description = entityBottle.Description;
            ContentItemsCount = entityBottle.ContentItemsCount;
            IsContentLoaded = entityBottle.IsContentLoaded;
            Category = entityBottle.Category;
            Created = entityBottle.Created;
            EndTime = entityBottle.EndTime;
            LifeTime = (int)(EndTime - Created).TotalSeconds;
            Active = entityBottle.Active;
            PickingUp = entityBottle.PickingUp;
            MaxPickingUp = entityBottle.MaxPickingUp;
            UserId = entityBottle.UserId;
        }

        public int Id { get; set; }
        public decimal Lat { get; set; }
        public decimal Lng { get; set; }
        public string GeoObjectName { get; set; }
        public string Address { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int ContentItemsCount { get; set; }
        public bool IsContentLoaded { get; set; }
        public int[] ContentIds { get; set; }
        public string Category { get; set; }
        public long LifeTime { get; set; }
        public DateTime Created { get; set; }
        public DateTime EndTime { get; set; }
        public bool Active { get; set; }
        public int MaxPickingUp { get; set; }
        public int PickingUp { get; set; }
        public string UserId { get; set; }
    }
}
