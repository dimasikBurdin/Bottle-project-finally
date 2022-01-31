using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Models
{
    public class ExternalLoginModel
    {
        [Required]
        public ExternalProvider Provider { get; set; }
        [Required]
        public string ProviderId { get; set; }
        [Required]
        public string AccessToken { get; set; }
        public bool RememberMe { get; set; } = false;
    }

    public enum ExternalProvider
    {
        Google,
        Facebook,
        VK,
        Instagram
    }
}
