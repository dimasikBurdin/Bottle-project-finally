using Bottle.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Bottle.Utilities
{
    public class GoogleProviderUser : ExternalProviderUser
    {
        private string url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=";

        public override async Task<bool> CheckAuthorizeAsync(string userId, string accessToken)
        {
            var requestContent = await GetRequestAsync(url + accessToken);
            var contentModel = JsonConvert.DeserializeObject<AuthenticateResult>(requestContent);
            return userId == contentModel.user_id;
        }

        private class AuthenticateResult
        {
            public string user_id { get; set; }
        }
    }
}
