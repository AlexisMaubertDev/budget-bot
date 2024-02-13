import express, { query } from "express";
import cors from "cors";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { verPresupuestos } from "./services/verPresupuestos.js";
import { crearPresupuesto } from "./services/crearPresupuesto.js";
import { borrarPresupuesto } from "./services/borrarPresupuesto.js";
import { agregarAlPresupuesto } from "./services/agregarAlPresupuesto.js";
import { restarAlPresupuesto } from "./services/restarAlPresupuesto.js";

dotenv.config();
const budgetin = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

var userState = null;
var nombre = "";
const regex = /^(?!\/start$).*/;

const firstMessage = (chatId) => {
  return budgetin.sendMessage(
    chatId,
    "Hola soy Budgetín!, soy un bot que te va a ayudar para organizar tus cuentas. ¿Qué querés hacer?",
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Ver todas las categorías", callback_data: "verTodo" },
            { text: "Reiniciar gastos", callback_data: "reiniciar" },
          ],
          [
            { text: "Sumar al saldo", callback_data: "saldo" },
            { text: "Agregar gasto", callback_data: "gasto" },
          ],
        ],
      },
    }
  );
};
const notANumber = (chatId) => {
  return budgetin.sendMessage(
    chatId,
    "No puedo agregar eso al presupuesto. \n Intentalo otra vez."
  );
};

budgetin.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  firstMessage(chatId);
});

budgetin.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const presupuestos = await verPresupuestos();
  const presupuestosListados = presupuestos
    .map((presupuesto) => `- ${presupuesto.nombre} : ${presupuesto.saldo} `)
    .join("\n");

  switch (data) {
    case "verTodo":
      if (presupuestos.length !== 0) {
        budgetin.sendMessage(chatId, `${presupuestosListados}`, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Agregar presupuesto", callback_data: "nuevo" },
                { text: "Borrar presupuesto", callback_data: "borrar" },
              ],
              [{ text: "Cancelar", callback_data: "despedida" }],
            ],
          },
        });
      } else {
        budgetin.sendMessage(chatId, `No tenés ningún presupuesto activo.`, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Agregar presupuesto", callback_data: "nuevo" },
                { text: "Borrar presupuesto", callback_data: "borrar" },
              ],
              [{ text: "Cancelar", callback_data: "despedida" }],
            ],
          },
        });
      }
      break;
    case "reiniciar":
      budgetin.sendMessage(chatId, `El presupuesto se reinició.`);

      break;
    case "saldo":
      budgetin.sendMessage(
        chatId,
        `${presupuestosListados}.\nIngresá el nombre del presupuesto al que quieras agregar`
      );
      break;
    case "gasto":
      budgetin.sendMessage(
        chatId,
        `${presupuestosListados}.\nIngresá el nombre del presupuesto al que quieras restarle`
      );
      break;
    case "nuevo":
      budgetin.sendMessage(chatId, `¿Cómo querés que se llame?`);
      break;

    case "despedida":
      budgetin.sendMessage(
        chatId,
        `Gracias por usar Budgetin. \nVolvé pronto.`
      );
      break;
    case "borrar":
      budgetin.sendMessage(
        chatId,
        `Escribí el nombre del presupuesto que deseas borrar.`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Cancelar", callback_data: "despedida" }],
            ],
          },
        }
      );
      break;
    default:
      break;
  }
  userState = data;
});

budgetin.onText(regex, async (msg) => {
  const chatId = msg.chat.id;
  const cant = parseInt(msg.text);
  const presupuestos = await verPresupuestos();
  const nombres = presupuestos.map((presupuestos) => presupuestos.nombre);

  switch (userState) {
    case "reiniciar":
      dataPiola.cant = cant;
      budgetin.sendMessage(
        chatId,
        `Esta todo listo para que vuelvas a empezar :)`
      );
      break;
    case "saldo":
      if (nombres.includes(msg.text)) {
        nombre = msg.text;
        userState = "agregarSaldo";
        budgetin.sendMessage(chatId, `¿Cuánto querés agregarle?`);
      } else {
        budgetin.sendMessage(
          chatId,
          `No encontré un presupuesto con ese nombre, asegurate de que esté bien escrito.\nAsegurate de escribir bien el nombre del presupuesto al que deseas agregarle saldo.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "Cancelar", callback_data: "despedida" }],
              ],
            },
          }
        );
      }
      break;
    case "agregarSaldo":
      if (cant !== NaN) {
        userState = null;
        const presupuestoAgregado = await agregarAlPresupuesto(nombre, cant);
        budgetin.sendMessage(
          chatId,
          `Se agregaron ${cant} al presupuesto ${nombre}.\n El saldo es de ${presupuestoAgregado.saldo}`
        );
        nombre = "";
      } else {
        notANumber(chatId);
      }
      break;
    case "gasto":
      if (nombres.includes(msg.text)) {
        nombre = msg.text;
        userState = "agregarGasto";
        budgetin.sendMessage(chatId, `¿Cuánto querés restarle?`);
      } else {
        budgetin.sendMessage(
          chatId,
          `No encontré un presupuesto con ese nombre, asegurate de que esté bien escrito.\nAsegurate de escribir bien el nombre del presupuesto al que deseas restarle saldo.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "Cancelar", callback_data: "despedida" }],
              ],
            },
          }
        );
      }
      break;
    case "agregarGasto":
      if (cant !== NaN) {
        userState = null;
        const presupuestoRestado = await restarAlPresupuesto(nombre, cant);
        budgetin.sendMessage(
          chatId,
          `Se restaron ${cant} al presupuesto ${nombre}.\n El saldo es de ${presupuestoRestado.saldo}`
        );
        nombre = "";
      } else {
        notANumber(chatId);
      }
      break;
    case "nuevo":
      nombre = msg.text;
      userState = "nombrado";
      budgetin.sendMessage(
        chatId,
        `¿${msg.text}? Genial. \n¿Cuánto querés que sea el saldo?`
      );
      break;

    case "borrar":
      if (nombres.includes(msg.text)) {
        await borrarPresupuesto(msg.text);
        userState = null;
        budgetin.sendMessage(chatId, `El presupuesto fue borrado con exito`);
      } else {
        budgetin.sendMessage(
          chatId,
          `No encontré un presupuesto con ese nombre, asegurate de que esté bien escrito.\nAsegurate de escribir bien el nombre del presupuesto que deseas borrar.`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "Cancelar", callback_data: "despedida" }],
              ],
            },
          }
        );
      }
      break;
    case "nombrado":
      if (msg !== NaN) {
        userState = null;
        await crearPresupuesto(nombre, cant);
        nombre = "";
        budgetin.sendMessage(chatId, `Creaste con éxito el presupuesto.`);
      } else {
        notANumber(chatId);
      }
      break;

    default:
      firstMessage(chatId);
      break;
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
