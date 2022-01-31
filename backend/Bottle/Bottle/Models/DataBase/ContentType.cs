using System.Collections.Generic;

namespace Bottle.Models.DataBase
{
    public class ContentType
    {
        public int Id { get; set; }
        public string Type { get; set; }

        public List<BottleContent> BottleContents { get; set; }
    }
}