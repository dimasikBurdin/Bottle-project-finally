using Bottle.Models;
using Bottle.Properties;
using Bottle.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Resources;
using System.Threading.Tasks;

namespace Bottle.Controllers
{
    [Route("api/user")]
    [Authorize]
    public class UserController : Controller
    {
        private readonly BottleDbContext db;

        public UserController(BottleDbContext db)
        {
            this.db = db;
        }

        [HttpGet("{id}")]
        public IActionResult Get(string id)
        {
            var user = db.GetUser(id);
            if (user == null)
                return NotFound();
            return Ok(new UserModel(user, db.GetUserRating(id)));
        }

        [HttpGet("{id}/avatar")]
        public IActionResult GetAvatar(string id)
        {
            var user = db.GetUser(id);
            if (user.Avatar == null)
            {
                var resourceManager = new ResourceManager(typeof(Resources));
                var picture = resourceManager.GetObject("avatar" + user.AvatarId);
                return File((byte[])picture, "image/png");
            }
            return File(user.Avatar, user.AvatarContentType);
        }
    }
}
