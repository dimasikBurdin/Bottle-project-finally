using Bottle.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Bottle.Utilities
{
    public abstract class ExternalProviderUser
    {
        public abstract Task<bool> CheckAuthorizeAsync(string userId, string accessToken);

        public static ExternalProviderUser GetProvider(ExternalProvider externalProvider)
        {
            switch (externalProvider)
            {
                case ExternalProvider.Google:
                    return new GoogleProviderUser();
                case ExternalProvider.Facebook:
                    return new FacebookProviderUser();
                case ExternalProvider.VK:
                    break;
                case ExternalProvider.Instagram:
                    break;
            }
            throw new NotImplementedException();
        }

        protected async Task<string> GetRequestAsync(string url)
        {
            HttpClient httpClient = new HttpClient();
            var request = await httpClient.GetAsync(url);
            return await request.Content.ReadAsStringAsync();
        }
    }
}
