import { Presupuesto } from "../models/Presupuesto.model.js";

export const agregarAlPresupuesto = async (nombre, cantidad) => {
  try {
    //Busco el presupuesto por nombre
    const presupuesto = await Presupuesto.findOne({ where: { nombre } });

    //Sumo la cantidad elegida al saldo del presupuesto
    presupuesto.saldo += cantidad;

    //Guardo los cambios en la bdd
    presupuesto.save();

    return presupuesto;
  } catch (error) {
    console.log(error);
  }
};
