using Bottle.Models.DataBase;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Utilities
{
    public class RoleInitializer
    {
        public static async Task InitializeAsync(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            if (!await roleManager.RoleExistsAsync("confirmed"))
            {
                await roleManager.CreateAsync(new IdentityRole("confirmed"));
            }

            if (!await roleManager.RoleExistsAsync("not-confirmed"))
            {
                await roleManager.CreateAsync(new IdentityRole("not-confirmed"));
            }

            if (await userManager.FindByNameAsync("string") == null)
            {
                User user = new User { Email = "string@mail.ru", UserName = "string", Sex = "attack helicopter", Type = 1, AvatarId = 1 };
                if ((await userManager.CreateAsync(user, "string")).Succeeded)
                {
                    await userManager.AddToRoleAsync(user, "confirmed");
                }
            }
        }
    }
}
