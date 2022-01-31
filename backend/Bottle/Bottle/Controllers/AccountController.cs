using Bottle.Models;
using Bottle.Models.DataBase;
using Bottle.Properties;
using Bottle.Utilities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Resources;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Bottle.Controllers
{
    [Route("api/account")]
    [Authorize]
    public class AccountController : Controller
    {
        private readonly BottleDbContext db;
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;
        private static readonly Random random = new Random();

        public AccountController(BottleDbContext dbContext, UserManager<User> userManager, SignInManager<User> signInManager)
        {
            this.db = dbContext;
            this.userManager = userManager;
            this.signInManager = signInManager;
        }

        /// <summary>
        /// Выйти из аккаунта
        /// </summary>
        [HttpPost("logout")]
        [ProducesResponseType(200)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> Logout()
        {
            await signInManager.SignOutAsync();
            return Ok();
        }

        /// <summary>
        /// Получить информацию о пользователе
        /// </summary>
        [HttpGet]
        [ProducesResponseType(200)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> GetInformationAsync()
        {
            var user = await userManager.GetUserAsync(HttpContext.User);
            var cd = db.CommercialData.FirstOrDefault(c => c.Id == user.Id);
            return Ok(new Account(user, db.GetUserRating(user.Id)));
        }

        /// <summary>
        /// Получить аватар пользователя
        /// </summary>
        [HttpGet("avatar")]
        [ProducesResponseType(200)]
        [ProducesResponseType(403)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetAvatarAsync()
        {
            var user = await userManager.GetUserAsync(HttpContext.User);
            if (user.Avatar == null)
            {
                var resourceManager = new ResourceManager(typeof(Resources));
                var picture = resourceManager.GetObject("avatar" + user.AvatarId);
                return File((byte[])picture, "image/png");
            }
            return File(user.Avatar, user.AvatarContentType);
        }

        /// <summary>
        /// Зарегистрировать пользователя
        /// </summary>
        /// <param name="data">Данные, необходимые для регистрации</param>
        [HttpPost]
        [AllowAnonymous]
        [ProducesResponseType(201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> RegisterUser([FromBody] RegistrationUserModel data)
        {
            if (ModelState.IsValid)
            {
                User user = new User { Email = data.Email, UserName = data.Nickname, Sex = data.Sex };
                if (data.CommercialData == null)
                {
                    user.Type = 1;
                }
                else
                {
                    user.Type = 2;
                    user.CommercialData = new CommercialData(data.CommercialData);
                }
                user.AvatarId = random.Next(1, int.Parse(Resources.avatarsCount) + 1);
                var result = await userManager.CreateAsync(user, data.Password);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "confirmed");
                    await signInManager.SignInAsync(user, false);
                    return Created(string.Empty, new Account(user, Rating.Zero));
                }
                else
                {
                    return BadRequest();
                }
            }
            return BadRequest("Некорректные данные");
        }

        /// <summary>
        /// Войти в аккаунт
        /// </summary>
        /// <param name="data">Данные, необходимые для входа в аккаунт</param>
        [HttpPost("login")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginModel data)
        {
            if (ModelState.IsValid && !(string.IsNullOrEmpty(data.Nickname) && string.IsNullOrEmpty(data.Email)))
            {
                User user;
                if (data.Nickname != null)
                {
                    user = db.Users.FirstOrDefault(u => u.UserName == data.Nickname);
                }
                else
                {
                    user = db.Users.FirstOrDefault(u => u.Email == data.Email);
                }
                if (user != null)
                {
                    var result = await signInManager.PasswordSignInAsync(user.UserName, data.Password, data.RememberMe, false);
                    if (result.Succeeded)
                    {
                        var cd = db.CommercialData.FirstOrDefault(d => d.Id == user.Id);
                        return Ok(new Account(user, cd, db.GetUserRating(user.Id)));
                    }
                }
            }
            return BadRequest("Некорректные данные");
        }

        [HttpPost("external-register")]
        [AllowAnonymous]
        public async Task<IActionResult> ExternalRegister([FromBody] ExternalRegisterModel model)
        {
            if (ModelState.IsValid)
            {
                var externalProvider = ExternalProviderUser.GetProvider(model.ExternalLogin.Provider);
                var isAuthorize = await externalProvider.CheckAuthorizeAsync(model.ExternalLogin.ProviderId, model.ExternalLogin.AccessToken);
                if (isAuthorize)
                {
                    var user = db.Users.FirstOrDefault(u => u.Provider == model.ExternalLogin.Provider && u.ProviderId == model.ExternalLogin.ProviderId);
                    if (user == null)
                    {
                        user = new User { Provider = model.ExternalLogin.Provider, ProviderId = model.ExternalLogin.ProviderId, UserName = model.Nickname, Sex = model.Sex };
                        if (model.CommercialData == null)
                        {
                            user.Type = 1;
                        }
                        else
                        {
                            user.Type = 2;
                            user.CommercialData = new CommercialData(model.CommercialData);
                        }
                        user.AvatarId = random.Next(1, int.Parse(Resources.avatarsCount) + 1);
                        var result = await userManager.CreateAsync(user);
                        await userManager.AddToRoleAsync(user, "confirmed");
                        if (result.Succeeded)
                        {
                            await signInManager.SignInAsync(user, model.ExternalLogin.RememberMe);
                            return Created(string.Empty, new Account(user, Rating.Zero));
                        }
                    }
                }
            }
            return BadRequest();
        }

        /// <summary>
        /// Войти в аккаунт через внешнего провайдера
        /// </summary>
        [HttpPost("external-login")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        [AllowAnonymous]
        public async Task<IActionResult> ExternalLoginAsync([FromBody] ExternalLoginModel model)
        {
            if (ModelState.IsValid)
            {
                var externalProvider = ExternalProviderUser.GetProvider(model.Provider);
                var isAuthorize = await externalProvider.CheckAuthorizeAsync(model.ProviderId, model.AccessToken);
                if (isAuthorize)
                {
                    var user = db.Users.FirstOrDefault(u => u.Provider != null && u.ProviderId == model.ProviderId);
                    if (user == null)
                    {
                        return NotFound();
                    }
                    else
                    {
                        await signInManager.SignInAsync(user, model.RememberMe);
                        return Ok(new Account(user, db.GetUserRating(user.Id)));
                    }
                }
            }
            return BadRequest();
        }

        /// <summary>
        /// Изменить аватар пользователя
        /// </summary>
        /// <param name="file">Загружаемое фото</param>
        [HttpPost("avatar")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> ChangeAvatarAsync(IFormFile file)
        {
            var user = await userManager.GetUserAsync(HttpContext.User);
            if (file == null)
            {
                user.Avatar = null;
                user.AvatarContentType = null;
                user.AvatarId = random.Next(1, int.Parse(Resources.avatarsCount) + 1);
                db.SaveChanges();
                return Ok();
            }
            byte[] imageData = null;
            using (var binaryReader = new BinaryReader(file.OpenReadStream()))
            {
                imageData = binaryReader.ReadBytes((int)file.Length);
            }
            user.AvatarId = 0;
            user.Avatar = imageData;
            user.AvatarContentType = file.ContentType;
            db.SaveChanges();
            return Ok();
        }

        /// <summary>
        /// Изменить данные пользователя
        /// </summary>
        [HttpPatch]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> ChangeInformationAsync([FromBody] Account data)
        {
            if (ModelState.IsValid)
            {
                var user = await userManager.GetUserAsync(HttpContext.User);
                user.Sex = data.Sex is null ? user.Sex : data.Sex;
                if (user.Type == 2)
                {
                    user.CommercialData.FullName = data.CommercialData.FullName is null ? user.CommercialData.FullName : data.CommercialData.FullName;
                    user.CommercialData.IdentificationNumber = data.CommercialData.IdentificationNumber is null ? user.CommercialData.IdentificationNumber : data.CommercialData.IdentificationNumber;
                    user.CommercialData.PSRN = data.CommercialData.PSRN is null ? user.CommercialData.PSRN : data.CommercialData.PSRN;
                }
                db.SaveChanges();
                var account = new Account(user, user.CommercialData, db.GetUserRating(user.Id));
                return Ok(account);
            }
            return BadRequest();
        }

        [HttpPost("password")]
        public async Task<IActionResult> ChangePasswordAsync([FromBody] ChangePasswordModel model)
        {
            var user = await userManager.GetUserAsync(User);
            if (user.Provider == null)
            {
                var result = await userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
                if (result.Succeeded)
                {
                    return Ok();
                }
                return Ok(new Account(user, db.GetUserRating(user.Id.ToString())));
            }
            return BadRequest();
        }

        /// <summary>
        /// Удалить пользователя
        /// </summary>
        [HttpDelete]
        [ProducesResponseType(200)]
        [ProducesResponseType(403)]
        public async Task<IActionResult> DeleteUser()
        {
            User user = await userManager.GetUserAsync(HttpContext.User);
            await userManager.DeleteAsync(user);
            await signInManager.SignOutAsync();
            return Ok();
        }

        [HttpGet("external-providers")]
        [AllowAnonymous]
        public IActionResult GetExternalProviders()
        {
            return Ok(Enum.GetValues<ExternalProvider>().ToDictionary(v => v));
        }
    }
}
