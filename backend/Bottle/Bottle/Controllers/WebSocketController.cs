using Bottle.Models;
using Bottle.Models.DataBase;
using Bottle.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;

namespace Bottle.Controllers
{
    [Route("ws")]
    public class WebSocketController : Controller
    {
        public WebSocketController(UserManager<User> userManager, SignInManager<User> signInManager)
        {
            this.userManager = userManager;
            this.signInManager = signInManager;
        }


        // Список всех клиентов
        private static readonly Dictionary<string, HashSet<WebSocketUser>> Clients = new();

        // Блокировка для обеспечения потокабезопасности
        private static readonly ReaderWriterLockSlim Locker = new ReaderWriterLockSlim();
        private readonly UserManager<User> userManager;
        private readonly SignInManager<User> signInManager;

        [HttpGet]
        [Authorize]
        public async Task Index()
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                using WebSocket webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                var userId = userManager.GetUserId(HttpContext.User);
                var client = new WebSocketUser(webSocket, userId);
                client.SendMessage += message => client.SetCoordinates(message);
                client.ClientClosedConnection += message => Clients[client.id].Remove(client);
                if (Clients.TryGetValue(userId, out var webSockets))
                {
                    webSockets.Add(client);
                }
                else
                {
                    Clients[userId] = new() { client };
                }
                await client.Listen();
                Clients[client.id].Remove(client);
            }
            else
            {
                HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            }
        }

        [HttpGet("event-types")]
        public IActionResult GetWebSocketEventTypes()
        {
            return Ok(Enum.GetValues<WebSocketRequestModel.EventType>().ToDictionary(v => v));
        }

        public static async Task EchoWebSocketsUser(string id, object model)
        {
            if (Clients.TryGetValue(id, out var webSocketClients))
            {
                foreach (var e in webSocketClients)
                {
                    await e.Echo(model);
                }
            }
        }

        public static async Task EchoWebSocketsUser(string id, string message)
        {
            if (Clients.TryGetValue(id, out var webSocketClients))
            {
                foreach (var e in webSocketClients)
                {
                    await e.Echo(message);
                }
            }
        }

        public static async Task OnSendMessage(string id, MessageModel message)
        {
            await EchoWebSocketsUser(id, new WebSocketRequestModel
            {
                EventNumber = WebSocketRequestModel.EventType.SendMessage,
                Model = message
            });
        }

        public static async Task OnCreatingDialog(string id, DialogModel dialog)
        {
            await EchoWebSocketsUser(id, new WebSocketRequestModel
            {
                EventNumber = WebSocketRequestModel.EventType.CreateDialog,
                Model = dialog
            });
        }

        public static async Task OnClosedDialog(string id, DialogModel dialog)
        {
            await EchoWebSocketsUser(id, new WebSocketRequestModel
            {
                EventNumber = WebSocketRequestModel.EventType.CloseDialog,
                Model = dialog
            });
        }

        public static async Task OnCreatingBottle(BottleModel bottle)
        {
            var recipientWebSockets = await GetRecipientWebSockets(bottle);
            foreach (var ws in recipientWebSockets)
            {
                await ws.Echo(new WebSocketRequestModel
                {
                    EventNumber = WebSocketRequestModel.EventType.CreateBottle,
                    Model = bottle
                });
            }
        }

        public static async Task OnPickedUdBottle(BottleModel bottle)
        {
            var recipientWebSockets = await GetRecipientWebSockets(bottle);
            foreach (var ws in recipientWebSockets)
            {
                await ws.Echo(new WebSocketRequestModel
                {
                    EventNumber = WebSocketRequestModel.EventType.BottlePickedUp,
                    Model = bottle
                });
            }
        }

        public static async Task OnTimeoutBottle(BottleModel bottle)
        {
            var recipientWebSockets = await GetRecipientWebSockets(bottle);
            foreach (var ws in recipientWebSockets)
            {
                await ws.Echo(new WebSocketRequestModel
                {
                    EventNumber = WebSocketRequestModel.EventType.BottleEndLife,
                    Model = bottle
                });
            }
        }

        public static async Task OnTimeoutBottles(IEnumerable<BottleModel> bottles)
        {
            foreach (var bottle in bottles)
            {
                await OnTimeoutBottle(bottle);
            }
        }

        private static async Task<IEnumerable<WebSocketUser>> GetRecipientWebSockets(BottleModel model)
        {
            var allWebSockets = Clients.SelectMany(c => c.Value);
            return await Task.Run(() =>
            {
                return allWebSockets.Where(ws =>
                {
                    return ws.Coordinates != null && BottlesController.IsPointInCircle(ws.Coordinates.Lat, ws.Coordinates.Lng, model.Lat, model.Lng, ws.Coordinates.Radius);
                });
            });
        }
    }
}
