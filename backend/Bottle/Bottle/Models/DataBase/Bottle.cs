using Bottle.Utilities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bottle.Models.DataBase
{
    public class Bottle
    {

        public Bottle()
        {

        }

        public Bottle(CreateBottleModel createBottleModel, User user) : this()
        {
            Lat = createBottleModel.Lat;
            Lng = createBottleModel.Lng;
            GeoObjectName = createBottleModel.GeoObjectName;
            Address = createBottleModel.Address;
            Title = createBottleModel.Title;
            Description = createBottleModel.Description;
            ContentItemsCount = createBottleModel.ContentItemsCount;
            IsContentLoaded = ContentItemsCount == 0;
            Category = createBottleModel.Category;
            Created = DateTime.UtcNow;
            EndTime = Created + TimeSpan.FromSeconds(createBottleModel.LifeTime);
            Active = true;
            PickingUp = 0;
            MaxPickingUp = 1;
            User = user;
        }

        public int Id { get; set; }

        [Column(TypeName = "decimal(18, 15)")]
        public decimal Lat { get; set; }

        [Column(TypeName = "decimal(18, 15)")]
        public decimal Lng { get; set; }
        public string GeoObjectName { get; set; }
        public string Address { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int ContentItemsCount { get; set; }
        public bool IsContentLoaded { get; set; }
        public string Category { get; set; }
        public DateTime Created { get; set; }
        public DateTime EndTime { get; set; }
        public bool Active { get; set; }
        public int MaxPickingUp { get; set; }
        public int PickingUp { get; set; }

        public string UserId { get; set; }
        public User User { get; set; }

        public List<Dialog> Dialogs { get; set; }
        public List<BottleContent> BottleContent { get; set; }
    }
}