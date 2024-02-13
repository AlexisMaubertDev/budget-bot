import { Presupuesto } from "../models/Presupuesto.model.js";

export const borrarPresupuesto = async (nombre) => {
  try {
    //Busco el presupuesto que quiero borrar
    const presupuesto = await Presupuesto.findOne({ where: { nombre } });

    await presupuesto.destroy();
  } catch (error) {
    console.log(error);
  }
};
