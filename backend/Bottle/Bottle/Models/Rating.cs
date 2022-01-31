using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Bottle.Models
{
    public class Rating
    {
        public decimal Value { get; set; }
        public Dictionary<int, int> Dict { get; set; }

        public static readonly Rating Zero = new Rating
        {
            Dict = new Dictionary<int, int>
            {
                { 1, 0 },
                { 2, 0 },
                { 3, 0 },
                { 4, 0 },
                { 5, 0 }
            },
            Value = 0
        };
    }
}
