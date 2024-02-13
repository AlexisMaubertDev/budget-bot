import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: "127.0.0.1",
    dialect: "mysql",
  }
);

(async () => {
  try {
    await sequelize.sync();
    console.log("Conectado a la base de datos");
  } catch (error) {
    console.error("Error de conexión:", error);
  }
})();
