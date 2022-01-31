using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Utilities
{
    public class FacebookProviderUser : ExternalProviderUser
    {
        private string url = "https://graph.facebook.com/me?access_token=";

        public override async Task<bool> CheckAuthorizeAsync(string userId, string accessToken)
        {
            var requestContent = await GetRequestAsync(url + accessToken);
            var contentModel = JsonConvert.DeserializeObject<AuthenticateResult>(requestContent);
            return userId == contentModel.id;
        }

        private class AuthenticateResult
        {
            public string id { get; set; }
        }
    }
}
