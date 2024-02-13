import { Presupuesto } from "../models/Presupuesto.model.js";

export const crearPresupuesto = async (nombre, saldo) => {
  try {
    //Creo el nuevo presupuesto
    const presupuesto = await Presupuesto.create({
      nombre,
      saldo,
    });
    //Devuelvo el presupuesto creado
    return presupuesto;
  } catch (error) {
    console.log(error);
  }
};
