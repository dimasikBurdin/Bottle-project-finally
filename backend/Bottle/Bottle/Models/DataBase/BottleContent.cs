using System.ComponentModel.DataAnnotations.Schema;

namespace Bottle.Models.DataBase
{
    public class BottleContent
    {
        public int Id { get; set; }
        public byte[] BinaryValue { get; set; }
        public string ContentType { get; set; }

        public int BottleId { get; set; }
        public Bottle Bottle;
    }
}