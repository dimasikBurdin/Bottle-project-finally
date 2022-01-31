namespace Bottle.Models.DataBase
{
    public class Message
    {
        public int Id { get; set; }
        public string Value { get; set; }
        public System.DateTime DateTime { get; set; }

        public int DialogId { get; set; }
        public Dialog Dialog { get; set; }

        public string SenderId { get; set; }
        public User Sender { get; set; }
    }
}
