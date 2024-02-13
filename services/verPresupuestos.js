import { Presupuesto } from "../models/Presupuesto.model.js";

export const verPresupuestos = async () => {
  try {
    //Busco todos los presupuestos
    const presupuesto = await Presupuesto.findAll();
    //Devuelvo un array con todos los presupuestos
    return presupuesto;
  } catch (error) {
    console.log(error);
  }
};
