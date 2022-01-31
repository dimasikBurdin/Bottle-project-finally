using Bottle.Models;
using Bottle.Models.DataBase;
using Bottle.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Controllers
{
    [Authorize(Roles = "confirmed")]
    [Route("api/bottles")]
    public class BottlesController : Controller
    {
        private BottleDbContext db;
        private readonly UserManager<User> userManager;

        public BottlesController(BottleDbContext db, UserManager<User> userManager)
        {
            this.db = db;
            this.userManager = userManager;
        }

        /// <summary>
        /// Получить информацию о бутылочке
        /// </summary>
        /// <param name="bottleId">ID бутылочки</param>
        [HttpGet("{bottle-id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetInformation([FromRoute(Name = "bottle-id")] int bottleId)
        {
            var bottle = await db.GetBottleModelAsync(bottleId);
            return bottle == null ? BadRequest("bottle not found") : Ok(bottle);
        }

        /// <summary>
        /// Подобрать бутылочку
        /// </summary>
        /// <param name="bottleId">ID бутылочки</param>
        [HttpPost("{bottle-id}/pick-up")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> PickUp([FromRoute(Name = "bottle-id")] int bottleId)
        {
            var bottle = await db.GetBottleAsync(bottleId);
            var user = await userManager.GetUserAsync(HttpContext.User);
            if (bottle == null || !bottle.Active || bottle.User == user)
                return BadRequest();
            var hasDialogWithUser = db.Dialogs.Where(d => d.BottleId == bottle.Id)
                                              .Any(d => d.RecipientId == user.Id);
            if (hasDialogWithUser)
            {
                return BadRequest();
            }
            bottle.PickingUp++;
            if (bottle.PickingUp >= bottle.MaxPickingUp)
            {
                bottle.Active = false;
                await WebSocketController.OnPickedUdBottle(db.GetBottleModel(bottle));
            }
            var dialog = new Dialog { BottleId = bottle.Id, BottleOwnerId = bottle.UserId, RecipientId = user.Id };
            db.Dialogs.Add(dialog);
            db.SaveChanges();
            await WebSocketController.OnCreatingDialog(bottle.UserId.ToString(), new DialogModel(dialog));
            return Ok(new { dialogId = dialog.Id });
        }

        /// <summary>
        /// Создать бутылочку
        /// </summary>
        /// <param name="data">Данные, необходимые для создания бутылочки</param>
        [HttpPost]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> Create([FromBody] CreateBottleModel data)
        {
            if (ModelState.IsValid)
            {
                var user = await userManager.GetUserAsync(HttpContext.User);
                var bottle = new Models.DataBase.Bottle(data, user);
                if (user.Type == 2)
                {
                    bottle.MaxPickingUp = data.MaxPickingUp;
                }
                db.Bottles.Add(bottle);
                db.SaveChanges();
                if (bottle.IsContentLoaded)
                    await WebSocketController.OnCreatingBottle(new BottleModel(bottle));
                return Created(string.Empty, new BottleModel(bottle));
            }
            return BadRequest();
        }

        ///// <summary>
        ///// Выбросить свою бутылочку обратно
        ///// </summary>
        ///// <remarks>
        ///// Если кто-то поднял вашу бутылочку
        ///// </remarks>
        ///// <param name="bottleId">ID бутылочки</param>
        //[HttpPost("{bottle-id}/throw")]
        //[ProducesResponseType(200)]
        //[ProducesResponseType(400)]
        //[ProducesResponseType(403)]
        //public IActionResult Throw([FromRoute(Name = "bottle-id")] int bottleId)
        //{
        //    var bottle = db.GetBottle(bottleId);
        //    var user = db.GetUser(User.Identity.Name);
        //    if (bottle == null || bottle.Active || bottle.UserId != user.Id)
        //        return BadRequest();
        //    bottle.Active = true;
        //    db.SaveChanges();
        //    return Ok(new BottleModel(bottle));
        //}

        [HttpPost("{bottle-id}/content")]
        public async Task<IActionResult> LoadContentAsync(IFormFile file, [FromRoute(Name = "bottle-id")] int bottleId)
        {
            if (file == null)
            {
                return BadRequest();
            }
            byte[] data = null;
            using (var binaryReader = new BinaryReader(file.OpenReadStream()))
            {
                data = binaryReader.ReadBytes((int)file.Length);
            }
            var bottle = await db.GetBottleAsync(bottleId);
            var user = await userManager.GetUserAsync(User);
            if (bottle == null || bottle.UserId != user.Id || bottle.IsContentLoaded)
            {
                return BadRequest();
            }
            var bottleContent = new BottleContent
            {
                BinaryValue = data,
                BottleId = bottle.Id,
                ContentType = file.ContentType
            };
            var contentCount = db.BottleContent.Count(bc => bc.BottleId == bottle.Id);
            if (contentCount >= bottle.ContentItemsCount - 1)
            {
                bottle.IsContentLoaded = true;
                await WebSocketController.OnCreatingBottle(db.GetBottleModel(bottle));
            }
            db.BottleContent.Add(bottleContent);
            db.SaveChanges();
            return Ok();
        }

        [HttpGet("{bottle-id}/content/{content-id}")]
        public IActionResult GetContent([FromRoute(Name = "bottle-id")] int bottleId, [FromRoute(Name = "content-id")] int contentId)
        {
            var content = db.BottleContent.FirstOrDefault(bc => bc.BottleId == bottleId && bc.Id == contentId);
            if (content == null)
                return BadRequest();
            return File(content.BinaryValue, content.ContentType);
        }

        /// <summary>
        /// Удалить бутылочку
        /// </summary>
        /// <param name="bottleId">ID бутылочки</param>
        [HttpDelete("{bottle-id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> Delete([FromRoute(Name = "bottle-id")] int bottleId)
        {
            var bottle = await db.GetBottleAsync(bottleId);
            var user = await userManager.GetUserAsync(HttpContext.User);
            if (bottle != null && bottle.Active && bottle.UserId == user.Id)
            {
                db.Bottles.Remove(bottle);
                db.SaveChanges();
                return Ok();
            }
            return BadRequest();
        }

        /// <summary>
        /// Получить бутылочки
        /// </summary>
        /// <param name="category">Категория бутылочки</param>
        /// <param name="radius">Радиус, в котором искать бутылочки(в км)</param>
        /// <param name="lat">Широта центра поиска бутылочек</param>
        /// <param name="lng">Долгота центра поиска бутылочек</param>
        [HttpGet]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetBottles(string category = null, double? radius = null, decimal? lat = null, decimal? lng = null)
        {
            IEnumerable<Models.DataBase.Bottle> result = null;
            var bottles = (await db.GetBottles()).Where(b => b.Active && b.IsContentLoaded);
            if (category != null)
                bottles = bottles.Where(b => b.Category == category);
            result = bottles;
            if (!(radius == null || lat == null || lng == null))
            {
                result = bottles.ToList().Where(b => IsPointInCircle(lat.Value, lng.Value, b.Lat, b.Lng, radius.Value));
            }
            return Ok(result.ToList().Select(b => db.GetBottleModel(b)));
        }

        /// <summary>
        /// Получить свои бутылочки
        /// </summary>
        [HttpGet("my")]
        [ProducesResponseType(200)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetMyBottles()
        {
            var userId = userManager.GetUserId(HttpContext.User);
            var bottles = (await db.GetBottles()).Where(b => b.UserId == userId);
            return Ok(bottles.ToList().Select(b => new BottleModel(b)));
        }

        /// <summary>
        /// Сообщить серверу о том, что срок годности бутылочки истёк
        /// </summary>
        /// <param name="bottleId">ID бутылочки</param>
        [HttpPost("{bottle-id}/timeout")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> BottleTimeout([FromRoute(Name = "bottle-id")] int bottleId)
        {
            var bottle = db.Bottles.FirstOrDefault(b => b.Id == bottleId);
            if (bottle != null && bottle.Active && bottle.EndTime <= DateTime.UtcNow)
            {
                await WebSocketController.OnTimeoutBottle(new BottleModel(bottle));
                db.Bottles.Remove(bottle);
                db.SaveChanges();
                return Ok();
            }
            return BadRequest();
        }









        public static bool IsPointInCircle(decimal Lat1, decimal Lng1, decimal Lat2, decimal Lng2, double radius)
        {
            return GetDistanceFromLatLon(Lat1, Lng1, Lat2, Lng2) <= radius;
        }

        private static double GetDistanceFromLatLon(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
        {
            const int R = 6371;
            var dLat = DegToRad(lat2 - lat1);
            var dLon = DegToRad(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegToRad(lat1)) * Math.Cos(DegToRad(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var d = R * c;
            return d;
        }

        private static double DegToRad(decimal angle)
        {
            return (double)(angle * (decimal)Math.PI / 180);
        }
    }
}
