using Bottle.Models.DataBase;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Models
{
    public class UserModel
    {
        public UserModel()
        {

        }

        public UserModel(User user, Rating rating)
        {
            if (user == null)
                return;
            Id = user.Id;
            Nickname = user.UserName;
            Rating = rating;
            Sex = user.Sex;
            Type = user.Type;
            CommercialData = user.CommercialData is null ? null : new CommercialModel(user.CommercialData);
        }

        public UserModel(User user, CommercialData commercialData, Rating rating) : this(user, rating)
        {
            CommercialData = commercialData is null ? null : new CommercialModel(commercialData);
        }

        public string Id { get; set; }
        public string Nickname { get; set; }
        public Rating Rating { get; set; }
        public string Sex { get; set; }
        public int Type { get; set; }
        public CommercialModel CommercialData { get; set; }
    }
}
