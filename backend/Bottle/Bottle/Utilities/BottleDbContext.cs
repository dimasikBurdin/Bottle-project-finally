using Bottle.Controllers;
using Bottle.Models.DataBase;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Bottle.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Utilities
{
    public class BottleDbContext : IdentityDbContext<User>
    {
        public BottleDbContext(DbContextOptions<BottleDbContext> options) : base(options)
        {
            if (Database.EnsureCreated())
            {
                UserTypes.Add(new UserType { Type = "DefaultUser" });
                UserTypes.Add(new UserType { Type = "Commercial" });
                SaveChanges();
            }
        }

        public DbSet<CommercialData> CommercialData { get; set; }
        public DbSet<UserRating> UserRating { get; set; }
        public DbSet<CommercialData> CommercialDatas { get; set; }
        public DbSet<UserType> UserTypes { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Dialog> Dialogs { get; set; }
        public DbSet<Models.DataBase.Bottle> Bottles { get; set; }
        public DbSet<BottleContent> BottleContent { get; set; }

        public User GetUser(string id)
        {
            var user = Users.FirstOrDefault(u => u.Id == id);
            var cd = CommercialData.FirstOrDefault(d => d.Id == user.Id);
            return user;
        }

        public async Task<Models.DataBase.Bottle> GetBottleAsync(int id)
        {
            var result = Bottles.FirstOrDefault(b => b.Id == id);
            if (result == null)
                return null;
            if (result.Active && result.EndTime <= DateTime.UtcNow)
            {
                await WebSocketController.OnTimeoutBottle(new BottleModel(result));
                if (Dialogs.Any(d => d.BottleId == result.Id))
                {
                    result.Active = false;
                }
                else
                {
                    Bottles.Remove(result);
                    SaveChanges();
                }
                return null;
            }
            return result;
        }

        public async Task<DbSet<Models.DataBase.Bottle>> GetBottles()
        {
            var timeoutBottles = Bottles.Where(b => b.Active && b.EndTime <= DateTime.UtcNow);
            await WebSocketController.OnTimeoutBottles(timeoutBottles.Select(b => new BottleModel(b)));
            foreach(var bottle in timeoutBottles)
            {
                bottle.Active = false;
            }
            var bottlesWithoutDialogs = timeoutBottles.Where(b => !Dialogs.Any(d => d.BottleId == b.Id));
            Bottles.RemoveRange(bottlesWithoutDialogs);
            SaveChanges();
            return Bottles;
        }

        public Dialog GetDialog(int id)
        {
            return Dialogs.FirstOrDefault(b => b.Id == id);
        }

        public Message GetLastMessage(Dialog dialog)
        {
            var dialogMessages = Messages.Where(m => m.DialogId == dialog.Id);
            if (dialogMessages.Any())
            {
                var id = dialogMessages.Max(m => m.Id);
                return dialogMessages.FirstOrDefault(m => m.Id == id);
            }
            return null;
        }

        public void SetUserRate(string id, int value)
        {
            var user = GetUser(id);
            if (User.IsValidRating(value))
            {
                UserRating.Add(new UserRating { DateTime = DateTime.UtcNow, User = user, Value = value });
            }
            SaveChanges();
        }

        public Rating GetUserRating(string id)
        {
            var dict = GetUserRatingDictionary(id);
            var sum = 0;
            var count = 0;
            foreach (var e in dict)
            {
                sum += e.Key * e.Value;
                count += e.Value;
            }
            if (count == 0)
                return Rating.Zero;
            return new Rating { Dict = dict, Value = (decimal)sum / count };
        }

        public async Task<BottleModel> GetBottleModelAsync(int bottleId)
        {
            var bottle = await GetBottleAsync(bottleId);
            return GetBottleModel(bottle);
        }

        public BottleModel GetBottleModel(Models.DataBase.Bottle bottle)
        {
            if (bottle == null)
                return null;
            var bottleContent = BottleContent.Where(bc => bc.BottleId == bottle.Id)
                                             .Select(bc => bc.Id)
                                             .ToArray();
            var result = new BottleModel(bottle);
            if (bottleContent.Length > 0)
                result.ContentIds = bottleContent;
            return result;
        }

        private Dictionary<int, int> GetUserRatingDictionary(string id)
        {
            var userRating = UserRating.Where(r => r.UserId == id);
            var possibleValues = new[] { 1, 2, 3, 4, 5 };
            var result = new Dictionary<int, int>();
            foreach (var e in possibleValues)
            {
                result[e] = userRating.Count(r => r.Value == e);
            }
            return result;
        }
    }
}
